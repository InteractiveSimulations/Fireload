// Rendering Data
uniform vec2  uResolution;  // current rendering resolution
uniform mat4  uViewMatrix;  // current view rendering matrix
uniform mat4  uProjMatrix;  // current projection rendering matrix
uniform mat4  uViewInverse; // current inverse view rendering matrix
uniform mat4  uProjInverse; // Added: current inverse projection rendering matrix
// Impostor Data
uniform sampler2D  uHeightfieldTex; // The heightfield texture of the impostor. Is assumed to be in a depth range of [0,1]
uniform sampler2D  uRadianceTex;    // The radiance/"color" texture of the impostor
vec3  bboxMin = vec3(-1.0, -1.0, -1.0); // x,y,z coordinate of the "minimum" impostor bounding box vertex in world space
vec3  bboxMax = vec3(1.0, 1.0, 1.0); // x,y,z coordinate of the "maximum" impostor bounding box vertex in world space
uniform mat4  uCaptureViewMat; // the view matrix of capture camera of the impostor
uniform mat4  uCaptureProjMat; // the projection matrix of capture camera of the impostor

varying vec2 vTexCoord;

///////////////////////////////////

float maxComponent(vec3 v) {
    return max( max(v.x, v.y), v.z );
}
float minComponent(vec3 v) {
    return min( min(v.x, v.y), v.z );
}
float safeInverse(float x) { 
    return (x == 0.0) ? 1000000000000.0 : (1.0 / x);
}
vec3  safeInverse(vec3 v) { 
    return vec3(safeInverse(v.x), safeInverse(v.y), safeInverse(v.z)); 
}

// Converts a position in camera space into a position in texture space [0,1]
vec3 Cam2Ts(vec3 camPos, mat4 projMat)
{
    vec4 pos_ndc = projMat * vec4(camPos, 1.0);
    vec3 pos_ts  = vec3(pos_ndc.xyz);
    pos_ts      /= pos_ndc.w;
    pos_ts      *= 0.5;
    pos_ts      += 0.5;
    //vec3 pos_ts  = (pos_ndc.xyz/pos_ndc.w) * 0.5 + vec3(0.5);

    //if ( all(greaterThanEqual(vTexCoord.xy, vec2(0.0))) && all(lessThanEqual(vTexCoord.xy, vec2(1.0))) )
    //if ( pos_ts.x >= 0.0 || pos_ts.y >= 0.0 || pos_ts.z >= 0.0 || pos_ts.x <= 0.0 || pos_ts.y <= 0.0 || pos_ts.z <= 0.0 )
//    if ( !(pos_ndc.w == 0.0) )
//    {
//        gl_FragColor = texture2D(uRadianceTex, vTexCoord.xy);
//            //        gl_FragColor   = texture2D(uRadianceTex, newTexCoords.xy);
//            //
//            //
//            //        vec4 hit_ndc = uProjMatrix*uViewMatrix*vec4(hitpoint_ws, 1.0);
//            //        hit_ndc     /= hit_ndc.w;
//            //        hit_ndc      = (hit_ndc + 1.0)*0.5;
//            //        gl_FragDepth = hit_ndc.z;
//    } else {
//        gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
//    }

    return pos_ts;
}

// Converts a position in texture space into a position in camera space
vec3 Ts2Cam(vec3 tsPos, mat4 invProj)
{
    vec3  pos_ndc   = (tsPos-0.5)*2.0;
    vec4  pos_cs    = invProj*vec4(pos_ndc, 1.0);
    pos_cs         /= pos_cs.w;
    return pos_cs.xyz;
}

// Converts a position in camera space into a position in world space
vec3 Cam2Ws(vec3 csPos, mat4 invView)
{
    vec4 wsPos = invView*vec4(csPos, 1.0);
    return wsPos.xyz;
}

bool ailaWaldHitAABox(vec3 boxCenter, vec3 boxRadius, vec3 rayOrigin, vec3 rayDirection, inout vec3 firstIntersectionPoint) {

    vec3 rayOriginCompute  = rayOrigin - boxCenter;
    vec3 invRayDirection   = safeInverse(rayDirection);
    vec3 t_min             = (-boxRadius - rayOriginCompute) * invRayDirection;
    vec3 t_max             = ( boxRadius - rayOriginCompute) * invRayDirection;
    float t0               = maxComponent(min(t_min, t_max));
    float t1               = minComponent(max(t_min, t_max));

    // Compute the intersection distance
    float distance = (t0 > 0.0) ? t0 : t1;
    firstIntersectionPoint = (rayOrigin + rayDirection * distance);

    return (t0 <= t1) && (distance > 0.0);
    
}

vec3 intersectBBox(vec3 start, vec3 direction)
{
    vec3 bbCenter   = (bboxMin.xyz + bboxMax.xyz) * 0.5;
    vec3 bbRadius   = vec3(abs(bboxMax.x - bboxMin.x)*0.5, abs(bboxMax.y - bboxMin.y)*0.5, abs(bboxMax.z - bboxMin.z)*0.5);
    vec3 E_w        = vec3(0.0, 0.0, 0.0);
    ailaWaldHitAABox(bbCenter, bbRadius, start + direction*EPSILON, direction, E_w);

    return E_w;
}


vec2 RaymarchHeightfieldSimple(inout vec3 hitpoint_ws, vec3 Start_w, vec3 End_w, mat4 viewMat, mat4 projMat, sampler2D heightfield, int steps, inout bool hit)
{
    
    vec3 Start_c              = (viewMat * vec4(Start_w, 1.0)).xyz;
    vec3 End_c                = (viewMat * vec4(End_w, 1.0)).xyz;


//    if ( End_c.x == 0.0 && End_c.y == 0.0 && End_c.z == 0.0 && End_c.x == 0.0 && End_c.y == 0.0 && End_c.z <= 0.0 )
//    {
//        gl_FragColor = texture2D(uRadianceTex, vTexCoord.xy);
//                //        gl_FragColor   = texture2D(uRadianceTex, newTexCoords.xy);
//                //
//                //
//                //        vec4 hit_ndc = uProjMatrix*uViewMatrix*vec4(hitpoint_ws, 1.0);
//                //        hit_ndc     /= hit_ndc.w;
//                //        hit_ndc      = (hit_ndc + 1.0)*0.5;
//                //        gl_FragDepth = hit_ndc.z;
//    } else {
//        gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
//    }

    mat4 test_projMat = mat4(   6.9395, 0.0, 0.0, 0.0,
                                0.0, 6.9395, 0.0, 0.0,
                                0.0, 1.0, -1.001, -0.1001,
                                0.0, 0.0, -1.0, 0.0 );
    
    vec3 Start_ts             = Cam2Ts(Start_c, test_projMat);
    vec3 End_ts               = Cam2Ts(End_c, test_projMat);
    vec3 d_ts                 = End_ts - Start_ts;
    float alpha               = 0.0;
    
    //Raaaaaay....MARCH!
    hit = false;
    int   currentStep          = 0;
    vec3  currentTexCoord      = Start_ts + alpha*d_ts; //currentTexCoord.z = ray depth in [0,1]
    float currentTextureDepth  = texture2D(heightfield, currentTexCoord.xy).r;

//    if ( Start_ts.x >= 0.0 || Start_ts.y >= 0.0 || Start_ts.x <= 0.0 || Start_ts.y <= 0.0 )
//    {
//        gl_FragColor = texture2D(uRadianceTex, vTexCoord.xy);
//        //        gl_FragColor   = texture2D(uRadianceTex, newTexCoords.xy);
//        //
//        //
//        //        vec4 hit_ndc = uProjMatrix*uViewMatrix*vec4(hitpoint_ws, 1.0);
//        //        hit_ndc     /= hit_ndc.w;
//        //        hit_ndc      = (hit_ndc + 1.0)*0.5;
//        //        gl_FragDepth = hit_ndc.z;
//    } else {
//        gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
//    }

//    //if ( all(greaterThanEqual(vTexCoord.xy, vec2(0.0))) && all(lessThanEqual(vTexCoord.xy, vec2(1.0))) )
//    if ( any(greaterThanEqual(Start_c, vec3(0.0))) || any(lessThanEqual(Start_c, vec3(0.0))) )
//    {
//        gl_FragColor = texture2D(uRadianceTex, vTexCoord.xy);
//        //        gl_FragColor   = texture2D(uRadianceTex, newTexCoords.xy);
//        //
//        //
//        //        vec4 hit_ndc = uProjMatrix*uViewMatrix*vec4(hitpoint_ws, 1.0);
//        //        hit_ndc     /= hit_ndc.w;
//        //        hit_ndc      = (hit_ndc + 1.0)*0.5;
//        //        gl_FragDepth = hit_ndc.z;
//    } else {
//        gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
//    }
        
    while( currentStep < steps )
    {
        // Terminate if ray is bellow the heightfield -> We found and intersection!
        if(alpha >= currentTextureDepth)
        {
            hit = true;
            break;
        }
        // Casting is not possible in WebGL
        float steps_float    = float(steps);
        alpha               += 1.0/steps_float;
        currentTexCoord      = Start_ts + alpha*d_ts;
        currentTextureDepth  = texture2D(heightfield, currentTexCoord.xy).r;
        currentStep++;
    }

//    if ( any(lessThanEqual(currentTexCoord, vec3(0.0))) || any(greaterThanEqual(currentTexCoord, vec3(0.0))) )
//    {
//        gl_FragColor = texture2D(uRadianceTex, vTexCoord.xy);
//        //        gl_FragColor   = texture2D(uRadianceTex, newTexCoords.xy);
//        //
//        //
//        //        vec4 hit_ndc = uProjMatrix*uViewMatrix*vec4(hitpoint_ws, 1.0);
//        //        hit_ndc     /= hit_ndc.w;
//        //        hit_ndc      = (hit_ndc + 1.0)*0.5;
//        //        gl_FragDepth = hit_ndc.z;
//    } else {
//        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
//    }

    if(hit)
    {
        vec3 result_ts    = Start_ts + alpha*d_ts;
        vec3 hitCoords_cs = Ts2Cam(result_ts, inverse(projMat));
        hitpoint_ws       = Cam2Ws(hitCoords_cs, inverse(viewMat));

        return result_ts.xy;
        //return currentTexCoord.xy;
    }
    else
    {
        //Dont really care what we return here, since hit==false results in discarding the fragment later
        hitpoint_ws = vec3(0.0, 0.0, 0.0);
        return vec2(-1.0, -1.0);
    }
}

void main(void){
      // Step1: Determine worldspace ray direction T_w, which goes from camera through the current pixel
    vec2 ray_start_window  = gl_FragCoord.xy;
    vec3 ray_start_ndc     = vec3(((ray_start_window / uResolution) - vec2(0.5))*2.0, -1.0);
    vec4 ray_start_world   = uProjInverse*vec4(ray_start_ndc, 1.0);
    ray_start_world       /= ray_start_world.w;
    ray_start_world        = uViewInverse*ray_start_world;
    vec3 T_w               = normalize(ray_start_world.xyz - cameraPosition.xyz);

    // Step2: Intersect T_w with the impostor bounding box. This results in S_w and E_w (start & endpoint in worldspace)
    vec3 S_w                 = intersectBBox(ray_start_world.xyz, T_w);
    vec3 E_w                 = intersectBBox(S_w + T_w*float(LARGE_FLOAT), -T_w);

    gl_FragColor = vec4(T_w, 1.0);

//    if ( E_w.x == 0.0 && E_w.y == 0.0 && E_w.z == 0.0 && E_w.x == 0.0 && E_w.y == 0.0 && E_w.z <= 0.0 )
//    {
//        gl_FragColor = texture2D(uRadianceTex, vTexCoord.xy);
//        //        gl_FragColor   = texture2D(uRadianceTex, newTexCoords.xy);
//        //
//        //
//        //        vec4 hit_ndc = uProjMatrix*uViewMatrix*vec4(hitpoint_ws, 1.0);
//        //        hit_ndc     /= hit_ndc.w;
//        //        hit_ndc      = (hit_ndc + 1.0)*0.5;
//        //        gl_FragDepth = hit_ndc.z;
//    } else {
//        gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
//    }

    //if ( E_w.x == 0.0 && E_w.y == 0.0 && E_w.z == 0.0 && E_w.x == 0.0 && E_w.y == 0.0 && E_w.z <= 0.0 )
//    if( any(lessThanEqual(S_w, vec3(0.0))) || any(greaterThanEqual(S_w, vec3(0.0))) )
//    {
//        gl_FragColor = texture2D(uRadianceTex, vTexCoord.xy);
//        //        gl_FragColor   = texture2D(uRadianceTex, newTexCoords.xy);
//        //
//        //
//        //        vec4 hit_ndc = uProjMatrix*uViewMatrix*vec4(hitpoint_ws, 1.0);
//        //        hit_ndc     /= hit_ndc.w;
//        //        hit_ndc      = (hit_ndc + 1.0)*0.5;
//        //        gl_FragDepth = hit_ndc.z;
//    } else {
//        gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
//    }

    // Step3: Check if heightfield is intersected "hit", and compute the intersected
    // texture coordinate "newTexCoords", as well as the corresponding world position "hitpoint_ws"
    // Increasing "steps" improves the precision of the result but also uses more computing power. Recommended values [16 - 128]
    int steps                = 128;
    vec2 newTexCoords        = vec2(vTexCoord.xy);
    vec3 hitpoint_ws         = vec3(0.0);
    bool hit                 = false;
    newTexCoords        = RaymarchHeightfieldSimple(hitpoint_ws, S_w, E_w, uCaptureViewMat, uCaptureProjMat, uHeightfieldTex, steps, hit);

    // Step4: If the heightfield surface was hit by the view ray, we sample the color at the returned texture coordinates
    // Also the depth of the intersected surface is computed and written into the depth buffer so it can interact with
    // other geometry correctly


//    //if ( all(greaterThanEqual(vTexCoord.xy, vec2(0.0))) && all(lessThanEqual(vTexCoord.xy, vec2(1.0))) )
//    if ( any(greaterThanEqual(newTexCoords.xy, vec2(0.0))) || any(lessThanEqual(newTexCoords, vec2(0.0))) )
//    {
//        gl_FragColor = texture2D(uRadianceTex, vTexCoord.xy);
////        gl_FragColor   = texture2D(uRadianceTex, newTexCoords.xy);
////
////
////        vec4 hit_ndc = uProjMatrix*uViewMatrix*vec4(hitpoint_ws, 1.0);
////        hit_ndc     /= hit_ndc.w;
////        hit_ndc      = (hit_ndc + 1.0)*0.5;
////        gl_FragDepth = hit_ndc.z;
//    } else {
//        gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
//    }

//    if (hit) {
//        gl_FragColor   = texture2D(uRadianceTex, newTexCoords.xy);
//
//        vec4 hit_ndc = uProjMatrix*uViewMatrix*vec4(hitpoint_ws, 1.0);
//        hit_ndc     /= hit_ndc.w;
//        hit_ndc      = (hit_ndc + 1.0)*0.5;
//        gl_FragDepth = hit_ndc.z;
//    } else {
//        gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
//    }




        //////////////////////////////////////////////////////////

}

