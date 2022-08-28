precision highp float;

struct Window {

    vec2  resolution;
    float pixelRatio;
};

struct SmokeDomain {

    vec3 min;
    vec3 max;
    vec3 center;
    vec3 radius;

};

struct Fire {
    SmokeDomain smokeDomain;
    sampler2D atlasesRGBA[4];
    sampler2D atlasesZ[4];
    int atlasFrame;
    int resolutionXY;
    int atlasResolutionXY;
    int numberOfAtlases;
};

struct Camera {

    mat4 view;
    mat4 viewInv;
    mat4 projection;
    mat4 projectionInv;
    int  perspective;

};

struct Spaces {
    vec2 window;
    vec4 ndc;
    vec4 camera;
    vec4 world;
    vec3 texture;
    vec3 atlas;
};

struct Ray {
    Spaces origin;
    Spaces end;
    vec3   direction;
    vec3   directionInv;
};

struct Intersection {

    bool hit;
    vec3 enter;
    vec3 exit;
};

varying vec2 vTexCoords;

uniform Window uWindow;
uniform Camera uCamera;
uniform Camera uCaptureCameras[4];
uniform Fire   uFire;

float maxComponent( vec3 v ) {
    return max( max( v.x, v.y ), v.z );
}

float minComponent( vec3 v ) {
    return min( min( v.x, v.y ), v.z );
}

// Converts a position in camera space into a position in texture space [0,1]
vec3 Cam2Ts(vec3 camPos, mat4 projMat)
{
    vec4 pos_ndc = projMat * vec4( camPos, 1.0f );
    vec3 pos_ts  = ( pos_ndc.xyz / pos_ndc.w ) * 0.5f + vec3( 0.5f );
    return pos_ts;
}

// Converts a position in texture space into a position in camera space
vec3 Ts2Cam(vec3 tsPos, mat4 invProj)
{
    vec3  pos_ndc   = ( tsPos - 0.5 ) * 2.0;
    vec4  pos_cs    = invProj * vec4( pos_ndc, 1.0 );
    pos_cs         /= pos_cs.w;
    return pos_cs.xyz;
}

// Converts a position in camera space into a position in world space
vec3 Cam2Ws( vec3 csPos, mat4 invView )
{
    vec4 wsPos = invView * vec4( csPos, 1.0 );
    return wsPos.xyz;
}

vec2 convertToAtlasSpace( vec2 texCoords, int frameNumber, int resolution ){

    vec2 atlasCoord;

    float resolutionF  = float( resolution  );
    float frameNumberF = float( frameNumber - 1 );
    float imagesPerDimension  =  4096.0f / resolutionF;

    float row                 = imagesPerDimension - floor( frameNumberF / imagesPerDimension ) - 1.0f;
    float col                 = mod( frameNumberF, imagesPerDimension );

    float imageSteps          =  1.0f / imagesPerDimension;

    //Scale current texCoords to [0,1]
    atlasCoord.x = ( texCoords.x / imagesPerDimension ) + ( col * imageSteps );
    atlasCoord.y = ( texCoords.y / imagesPerDimension ) + ( row * imageSteps );

    return atlasCoord;
}

Intersection intersectAABB( Ray ray ) {

    float t_min, t_max, t_y_min, t_y_max, t_z_min, t_z_max;

    vec3 bounds[2];
    bounds[0] = uFire.smokeDomain.min;
    bounds[1] = uFire.smokeDomain.max;

    ivec3 sign;
    sign.x = int( ray.directionInv.x < 0.0 );
    sign.y = int( ray.directionInv.y < 0.0 );
    sign.z = int( ray.directionInv.z < 0.0 );

    t_min   = ( bounds[ sign.x     ].x - ray.origin.world.x ) * ray.directionInv.x;
    t_max   = ( bounds[ 1 - sign.x ].x - ray.origin.world.x ) * ray.directionInv.x;

    t_y_min = ( bounds[ sign.y     ].y - ray.origin.world.y ) * ray.directionInv.y;
    t_y_max = ( bounds[ 1 - sign.y ].y - ray.origin.world.y ) * ray.directionInv.y;

    if ( t_min > t_y_max  || t_y_min > t_max )
        return Intersection( false, vec3(0.0), vec3(0.0) );

    if ( t_y_min > t_min )
        t_min = t_y_min;
    if ( t_y_max < t_max )
        t_max = t_y_max;

    t_z_min = ( bounds[ sign.z     ].z - ray.origin.world.z ) * ray.directionInv.z;
    t_z_max = ( bounds[ 1 - sign.z ].z - ray.origin.world.z ) * ray.directionInv.z;

    if ( t_min > t_z_max || t_z_min > t_max )
        return Intersection( false, vec3(0.0), vec3(0.0) );

    if ( t_z_min > t_min )
        t_min = t_z_min;
    if ( t_z_max < t_max )
        t_max = t_z_max;

    vec3 intersectionStart = ray.origin.world.xyz + ray.direction * t_min;
    vec3 intersectionEnd = ray.origin.world.xyz + ray.direction * t_max;

    return Intersection( true, intersectionStart, intersectionEnd );
}

vec2 intersectDepthMap( inout vec3 hitpoint_ws, Intersection intersection, sampler2D depthMap, int perspective, int steps, inout bool hit )
{

    Ray   ray;

    ray.origin.camera         = uCaptureCameras[ perspective ].view * vec4( intersection.enter, 1.0 );
    ray.end.camera            = uCaptureCameras[ perspective ].view * vec4( intersection.exit,  1.0 );

    ray.origin.texture        = Cam2Ts( ray.origin.camera.xyz, uCaptureCameras[ perspective ].projection );
    ray.end.texture           = Cam2Ts( ray.end.camera.xyz,    uCaptureCameras[ perspective ].projection );

    ray.origin.atlas          = vec3( convertToAtlasSpace( ray.origin.texture.xy, uFire.atlasFrame, uFire.resolutionXY ), 1.0 );
    ray.end.atlas             = vec3( convertToAtlasSpace( ray.end.texture.xy,    uFire.atlasFrame, uFire.resolutionXY ), 1.0 );

    ray.direction             = ray.end.atlas - ray.origin.atlas;


    float rayDepth = 1.0;

//    if ( perspective == 0 || perspective == 2 )
//        rayDepth = abs( intersection.exit.z - intersection.enter.z ) / ( 2.0 * uFire.smokeDomain.radius.z );
//    else
//        rayDepth = abs( intersection.exit.x - intersection.enter.x ) / ( 2.0 * uFire.smokeDomain.radius.x );


    hit                        = false;
    float alpha                = 0.0;
    float deltaTexCoords       = 1.0 / float( steps );
    int   currentStep          = 0;
    float currentRayDepth      = 0.0;
    float deltaRayDepth        = rayDepth / float( steps );
    vec3  currentTexCoords     = ray.origin.atlas + alpha * ray.direction;
    float currentTextureDepth  = texture2D( depthMap, currentTexCoords.xy ).r;

    while ( currentStep < steps )
    {

        if ( currentRayDepth > currentTextureDepth )
        {
            hit = true;
            break;
        }

        alpha               += deltaTexCoords;
        currentRayDepth     += deltaRayDepth;
        currentTexCoords     = ray.origin.atlas + alpha * ray.direction;
        currentTextureDepth  = texture2D( depthMap, currentTexCoords.xy ).r;
        currentStep++;

    }

    hit = currentRayDepth > currentTextureDepth;

    if ( hit )
    {

        // parallax occlusion mapping
        vec2 prevTexCoords = currentTexCoords.xy - deltaTexCoords * ray.direction.xy;

        float afterDepth  = currentTextureDepth - currentRayDepth;
        float beforeDepth = texture2D( depthMap, prevTexCoords ).r - currentRayDepth + deltaRayDepth;

        float weight = afterDepth / ( afterDepth - beforeDepth );
        vec2 finalTexCoords = prevTexCoords * weight + currentTexCoords.xy * ( 1.0 - weight );

        Spaces intersection;

        ray.direction           = ray.end.texture - ray.origin.texture;

//        intersection.texture    = ray.origin.texture + alpha * ray.direction;
//        intersection.texture.z  = currentRayDepth;

        intersection.texture.xy = finalTexCoords;
        intersection.texture.z  = beforeDepth * weight + currentRayDepth * ( 1.0 - weight );

        intersection.camera.xyz = Ts2Cam( intersection.texture,    uCaptureCameras[ perspective ].projectionInv );
        intersection.camera.z   = 1.0;

        hitpoint_ws             = Cam2Ws( intersection.camera.xyz, uCaptureCameras[ perspective ].viewInv       );

        return currentTexCoords.xy;;

    }
    else
    {

        hitpoint_ws = vec3(0,0,0);

        return vec2(-1,-1);

    }
}


//Intersection intersectAABB( Ray ray ) {
//
//    vec3 rayOriginCompute  = ray.origin.world.xyz - uFire.smokeDomain.center;
//    vec3 t_min             = ( -uFire.smokeDomain.radius - rayOriginCompute ) * ray.directionInv;
//    vec3 t_max             = (  uFire.smokeDomain.radius - rayOriginCompute ) * ray.directionInv;
//
//    float t0 = maxComponent( min( t_min, t_max ) );
//    float t1 = minComponent( max( t_min, t_max ) );
//
//    // Compute the intersection distance
//    float distance = (t0 > 0.0) ? t0 : t1;
//
//    vec3 enter = ( ray.origin.world.xyz + ray.direction * t0);
//    vec3 exit  = ( ray.origin.world.xyz + ray.direction * t1);
//
//    bool hit = (t0 <= t1) && (distance > 0.0);
//
//    return Intersection( hit, enter, exit);
//
//}

void main() {

    gl_FragDepth = gl_FragCoord.z;

    Ray ray;
    ray.origin.window  = gl_FragCoord.xy;

    ray.origin.ndc     = vec4( ray.origin.window / uWindow.resolution, -1.0, 1.0 );
    ray.origin.ndc.xy -= 0.5;
    ray.origin.ndc.xy *= 2.0;

    ray.origin.world       = uCamera.viewInv * uCamera.projectionInv * ray.origin.ndc;
    ray.origin.world.xyz  /= ray.origin.world.w;

    ray.direction      = normalize( ray.origin.world.xyz - cameraPosition.xyz );
    ray.directionInv   = 1.0 / ray.direction;

    Intersection intersection = intersectAABB( ray );

    int  steps         = 64;
    vec2 newTexCoords  = convertToAtlasSpace( vTexCoords, uFire.atlasFrame, uFire.resolutionXY );
    vec3 hitPointWorld = vec3( 0.0 );
    bool hit           = false;

    if ( intersection.hit ) {

        float epsilon = 0.00001;
        int   perspective;

//                if ( abs( intersection.enter.z - uFire.smokeDomain.max.z ) < epsilon ) {
//                    perspective = 0;
//                    newTexCoords = intersectDepthMap( hitPointWorld, intersection, uFire.atlasesZ[0], perspective, steps, hit );
//                }
//                else if ( abs( intersection.enter.x - uFire.smokeDomain.max.x ) < epsilon ) {
//                    perspective = 1;
//                    newTexCoords = intersectDepthMap( hitPointWorld, intersection, uFire.atlasesZ[1], perspective, steps, hit );
//                }
//                else if ( abs( intersection.enter.z - uFire.smokeDomain.min.z ) < epsilon ) {
//                    perspective = 2;
//                    newTexCoords = intersectDepthMap( hitPointWorld, intersection, uFire.atlasesZ[2], perspective, steps, hit );
//                }
//                else if ( abs( intersection.enter.x - uFire.smokeDomain.min.x ) < epsilon ) {
//                    perspective = 3;
//                    newTexCoords = intersectDepthMap( hitPointWorld, intersection, uFire.atlasesZ[3], perspective, steps, hit );
//                }

        switch (uCamera.perspective) {
            case 0:
                newTexCoords = intersectDepthMap( hitPointWorld, intersection, uFire.atlasesZ[0], uCamera.perspective, steps, hit );
                break;
            case 1:
                newTexCoords = intersectDepthMap( hitPointWorld, intersection, uFire.atlasesZ[1], uCamera.perspective, steps, hit );
                break;
            case 2:
                newTexCoords = intersectDepthMap( hitPointWorld, intersection, uFire.atlasesZ[2], uCamera.perspective, steps, hit );
                break;
            case 3:
                newTexCoords = intersectDepthMap( hitPointWorld, intersection, uFire.atlasesZ[3], uCamera.perspective, steps, hit );
                break;
        }

        if (hit)
        {

            vec4 rgbaColor;

            switch (uCamera.perspective) {
                case 0:
                    rgbaColor = texture2D( uFire.atlasesRGBA[0], newTexCoords.xy );
                    break;
                case 1:
                    rgbaColor = texture2D( uFire.atlasesRGBA[1], newTexCoords.xy );
                    break;
                case 2:
                    rgbaColor = texture2D( uFire.atlasesRGBA[2], newTexCoords.xy );
                    break;
                case 3:
                    rgbaColor = texture2D( uFire.atlasesRGBA[3], newTexCoords.xy );
                    break;
            }

            gl_FragColor = rgbaColor;

            vec4 hit_ndc = uCamera.projection * uCamera.view * vec4( hitPointWorld, 1.0 );
            hit_ndc     /= hit_ndc.w;
            hit_ndc      = ( hit_ndc + 1.0 ) * 0.5;
            gl_FragDepth = hit_ndc.z;

        } else
        discard;

    } else
    discard;

}

