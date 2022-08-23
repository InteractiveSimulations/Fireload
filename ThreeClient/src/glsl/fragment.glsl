struct Fire {
//    sampler2D atlasesRGBA_F[10];
//    sampler2D atlasesZ_F[10];
//    sampler2D atlasesRGBA_R[10];
//    sampler2D atlasesZ_R[10];
//    sampler2D atlasesRGBA_B[10];
//    sampler2D atlasesZ_B[10];
//    sampler2D atlasesRGBA_L[10];
//    sampler2D atlasesZ_L[10];
    int frame;
    int resolutionXY;
    int atlasResolutionXY;
    int numberOfAtlases;
};

struct Camera {
    int perspective;
};

uniform Fire   uFire;
uniform Camera uCamera;
uniform sampler2D atlasesRGBA_F[2];
uniform sampler2D atlasesZ_F[2];
uniform sampler2D atlasesRGBA_R[2];
uniform sampler2D atlasesZ_R[2];
uniform sampler2D atlasesRGBA_B[2];
uniform sampler2D atlasesZ_B[2];
uniform sampler2D atlasesRGBA_L[2];
uniform sampler2D atlasesZ_L[2];

varying vec2 vTexCoords;

vec2 convertToAtlasSpace(vec2 texCoords, int frameNumber, int resolution){

    vec2 atlasCoord;

    float resolutionF  = float( resolution  );
    float frameNumberF = float( frameNumber - 1 );
    float imagesPerDimension  =  4096.0f / resolutionF;

    float row                 = imagesPerDimension - floor(frameNumberF / imagesPerDimension) - 1.0f;
    float col                 = mod(frameNumberF, imagesPerDimension);

    float imageSteps          =  1.0f / imagesPerDimension;

    //Scale current texCoords to [0,1]
    atlasCoord.x = (texCoords.x / imagesPerDimension) + (col * imageSteps);
    atlasCoord.y = (texCoords.y / imagesPerDimension) + (row * imageSteps);

    return atlasCoord;
}

void main(){

//    sampler2D atlasesRGBA[uFire.numberOfAtlases];
//    sampler2D atlasesZ[uFire.numberOfAtlases];
//
//    for ( i= 0; i < uFire.numberOfAtlases; i++ ) {
//        atlasesRGBA[i] = uFire.atlasesRGBA[i];
//        atlasesZ[i]    = uFire.atlasesZ[i];
//    }

//    uFire.atlasesRGBA = atlasesRGBA;
//    uFire.atlasesZ    = atlasesZ;

    vec2 atlasCoords = convertToAtlasSpace(vTexCoords, 9, uFire.resolutionXY);
    vec4 atlasRGBA;
    vec3 perspectiveTest;

    switch (uCamera.perspective) {
        case 0:
        atlasRGBA = texture2D( atlasesRGBA_F[0], atlasCoords );
        perspectiveTest = vec3( 0.0, 1.0, 0.0 );
//        atlasZ    = atlasesZ_F[0];
        break;
        case 1:
        atlasRGBA = texture2D( atlasesRGBA_R[0], atlasCoords );
        perspectiveTest = vec3( 1.0, 0.0, 0.0 );
//        atlasZ    = atlasesZ_R[1];
        break;
        case 2:
        atlasRGBA = texture2D( atlasesRGBA_B[0], atlasCoords );
        perspectiveTest = vec3( 0.0, 0.0, 1.0 );
//        atlasZ    = atlasesZ_B[2];
        break;
        case 3:
        atlasRGBA = texture2D( atlasesRGBA_L[0], atlasCoords );
        perspectiveTest = vec3( 1.0, 0.0, 1.0 );
//        atlasZ    = atlasesZ_L[3];
        break;
    }



//    vec4 texColor = texture2D( atlasRGBA, atlasCoords );
//    gl_FragColor  = atlasRGBA.rgba;
    gl_FragColor  = vec4( perspectiveTest, 1.0 );

}

