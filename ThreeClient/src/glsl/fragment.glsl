struct Fire {
    sampler2D atlasesRGBA[4];
    sampler2D atlasesZ[4];
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

    vec2 atlasCoords = convertToAtlasSpace(vTexCoords, uFire.frame, uFire.resolutionXY);

    vec4 atlasRGBA;
    vec4 atlasZ;

    switch (uCamera.perspective) {
        case 0:
        atlasRGBA = texture2D( uFire.atlasesRGBA[0], atlasCoords );
        atlasZ    = texture2D( uFire.atlasesZ[0],    atlasCoords );
        break;
        case 1:
        atlasRGBA = texture2D( uFire.atlasesRGBA[1], atlasCoords );
        atlasZ    = texture2D( uFire.atlasesZ[1],    atlasCoords );
        break;
        case 2:
        atlasRGBA = texture2D( uFire.atlasesRGBA[2], atlasCoords );
        atlasZ    = texture2D( uFire.atlasesZ[2],    atlasCoords );
        break;
        case 3:
        atlasRGBA = texture2D( uFire.atlasesRGBA[3], atlasCoords );
        atlasZ    = texture2D( uFire.atlasesZ[3],    atlasCoords );
        break;
    }

    gl_FragColor = atlasRGBA.rgba;

}

