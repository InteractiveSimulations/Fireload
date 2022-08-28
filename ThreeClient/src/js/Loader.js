import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader";
import * as THREE from 'three';
import * as SCRIPT from './script'

// holds all the atlas filenames for server download
export let atlasFilenames = [];

/**
 * Loads a new or updates the parameters of a current floor texture.
 * Texture formats are .png or if compression is enabled .ktx2.
 * @param {object}     floorController - holds the current floor parameters.
 * @param {THREE.Mesh} floor           - floor mesh.
 * @param {string}     change          - describes which floor parameter was changed.
 */
export function loadFloorMaterial(floorController, floor, change = ''){

    if( floor.material.map == null || change === 'texture' || change === 'resolution' || change === 'compression' ) {

        if (floorController.texture == 'none') {

            //standard material is applied when none is chosen
            floor.material = new THREE.MeshStandardMaterial();

        } else {

            // loader for .png
            const textureLoader = new THREE.TextureLoader();
            textureLoader.setPath('assets/textures/floor/');

            // loader for .ktx2
            const ktx2Loader = new KTX2Loader();
            ktx2Loader.setPath('assets/textures/floor/');
            ktx2Loader.setTranscoderPath('libs/basis/');
            ktx2Loader.detectSupport(SCRIPT.renderer);

            // format strings to check which compression format the client transcoded the .ktx2/.basis format into
            const formatStrings = {
                [THREE.RGBAFormat]: 'RGBA32',
                [THREE.RGBA_BPTC_Format]: 'RGBA_BPTC',
                [THREE.RGBA_ASTC_4x4_Format]: 'RGBA_ASTC_4x4',
                [THREE.RGB_S3TC_DXT1_Format]: 'RGB_S3TC_DXT1',
                [THREE.RGBA_S3TC_DXT5_Format]: 'RGBA_S3TC_DXT5',
                [THREE.RGB_PVRTC_4BPPV1_Format]: 'RGB_PVRTC_4BPPV1',
                [THREE.RGBA_PVRTC_4BPPV1_Format]: 'RGBA_PVRTC_4BPPV1',
                [THREE.RGB_ETC1_Format]: 'RGB_ETC1',
                [THREE.RGB_ETC2_Format]: 'RGB_ETC2',
                [THREE.RGBA_ETC2_EAC_Format]: 'RGB_ETC2_EAC',
            };

            let diffuse, normal, roughness;

            if (floorController.compression) {

                // loading albedo/diffuse map
                diffuse = ktx2Loader.load(floorController.texture + '-diffuse_' + floorController.resolution + '.ktx2',
                    function (texture) {

                        // enable sRGB encoding needed for compressed formats
                        texture.encoding = THREE.sRGBEncoding;

                        console.info(`transcoded to ${formatStrings[texture.format]}\n
                                        Of Type CompressedTexture: ` + texture.isCompressedTexture);

                    },
                    undefined,
                    function (error) {
                        console.log('An error happened while loading the floors compressed diffuse texture!: ' + error);
                    }
                );

                //loading normal map
                normal = ktx2Loader.load(floorController.texture + '-normal_' + floorController.resolution + '.ktx2',
                    function (texture) {

                        // normal maps don't need sRGB encoding

                        console.info(`transcoded to ${formatStrings[texture.format]}\n
                                        Of Type CompressedTexture: ` + texture.isCompressedTexture);

                    },
                    undefined,
                    function (error) {
                        console.log('An error happened while loading the floors compressed normal texture!:' + error);
                    }
                );

                // loading roughness map
                roughness = ktx2Loader.load(floorController.texture + '-roughness_' + floorController.resolution + '.ktx2',
                    function (texture) {

                        // enable sRGB encoding needed for compressed formats
                        texture.encoding = THREE.sRGBEncoding;

                        console.info(`transcoded to ${formatStrings[texture.format]}\n
                                        Of Type CompressedTexture: ` + texture.isCompressedTexture);

                    },
                    undefined,
                    function (error) {
                        console.log('An error happened while loading the floors compressed roughness texture!: ' + error);
                    }
                );

            } else {

                // loading albedo/diffuse map
                diffuse = textureLoader.load(floorController.texture + '-diffuse_' + floorController.resolution + '.png',
                    //called when loading is in progresses
                    function (texture) {
                        console.log((texture.loaded / texture.total * 100) + '% loaded');
                    },
                    undefined,
                    //called when loading has errors
                    function (error) {
                        console.log('An error happened while loading the floor diffuse texture!');
                    }
                );

                //loading normal map
                normal = textureLoader.load(floorController.texture + '-normal_' + floorController.resolution + '.png',
                    //called when loading is in progresses
                    function (texture) {
                        console.log((texture.loaded / texture.total * 100) + '% loaded');
                    },
                    undefined,
                    //called when loading has errors
                    function (error) {
                        console.log('An error happened while loading the floor normaltexture!');
                    }
                );

                //loading roughness map
                roughness = textureLoader.load(floorController.texture + '-roughness_' + floorController.resolution + '.png',
                    //called when loading is in progresses
                    function (texture) {
                        console.log((texture.loaded / texture.total * 100) + '% loaded');
                    },
                    undefined,
                    //called when loading has errors
                    function (error) {
                        console.log('An error happened while loading the floor roughness texture!');
                    }
                );

            }

            // set maps parameters
            diffuse.wrapS      = THREE.RepeatWrapping;
            diffuse.wrapT      = THREE.RepeatWrapping;
            diffuse.repeat.set(floorController.repeat, floorController.repeat);
            diffuse.anisotropy = floorController.filtering;

            normal.wrapS      = THREE.RepeatWrapping;
            normal.wrapT      = THREE.RepeatWrapping;
            normal.repeat.set(floorController.repeat, floorController.repeat);
            normal.anisotropy = floorController.filtering;

            roughness.wrapS      = THREE.RepeatWrapping;
            roughness.wrapT      = THREE.RepeatWrapping;
            roughness.repeat.set(floorController.repeat, floorController.repeat);
            roughness.anisotropy = floorController.filtering;

            floor.material.map          = diffuse;
            floor.material.normalMap    = normal;
            floor.material.roughnessMap = roughness;

            floor.material.needsUpdate = true;

            // disposes the loader object, de-allocating any Web Workers created.
            ktx2Loader.dispose();

        }


    }

    // update maps repeat parameters
    if(change === 'repeat') {

        floor.material.map.wrapS = THREE.RepeatWrapping;
        floor.material.map.wrapT = THREE.RepeatWrapping;
        floor.material.map.repeat.set(floorController.repeat, floorController.repeat);
        floor.material.map.needsUpdate = true;

        floor.material.normalMap.wrapS = THREE.RepeatWrapping;
        floor.material.normalMap.wrapT = THREE.RepeatWrapping;
        floor.material.normalMap.repeat.set(floorController.repeat, floorController.repeat);
        floor.material.normalMap.needsUpdate = true;

        floor.material.roughnessMap.wrapS = THREE.RepeatWrapping;
        floor.material.roughnessMap.wrapT = THREE.RepeatWrapping;
        floor.material.roughnessMap.repeat.set(floorController.repeat, floorController.repeat);
        floor.material.roughnessMap.needsUpdate = true;

    }

    // update maps anisotropy parameters
    if(change === 'filtering') {

        floor.material.map.anisotropy = floorController.filtering;
        floor.material.map.needsUpdate = true;

        floor.material.normalMap.anisotropy = floorController.filtering;
        floor.material.normalMap.needsUpdate = true;

        floor.material.roughnessMap.anisotropy = floorController.filtering;
        floor.material.roughnessMap.needsUpdate = true;

    }

}

/**
 * Loads the simulation atlases asynchronously if the server finished the creation process.
 * @param {boolean} compression - if atlases are compressed.
 * @param {boolean} dummy - play dummy simulation.
 * @return {THREE.Texture[[[]]]} - three-dimensional Texture array which holds all simulation atlases for
 * a combination RGBA or Z and capture camera perspective.
 * first dimension: RGBA -> [0], Z -> [1]
 * second dimension: front -> [0], right -> [1], back -> [2], left -> [3]
 * third dimension: atlases with simulation frames
 */
export async function loadFireAtlases( compression, dummy ){

    let atlases = [];
    atlases.push([]);
    atlases.push([]);

    // loader for .png
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setPath('assets/simulations/');
    textureLoader.setPath('assets/simulations/')

    // loader for .ktx2
    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setPath('assets/simulations/');
    ktx2Loader.setTranscoderPath('libs/basis/');
    ktx2Loader.detectSupport(SCRIPT.renderer);

    if ( dummy ) {

        setDummyFilenames( compression );

        textureLoader.setPath('assets/simulations/dummy/');
        ktx2Loader.setPath('assets/simulations/dummy/');

    }

    // load atlases from server with help of atlasFilenames
    for(let perspective = 0; perspective < 4; perspective++ ) {

        atlases[0].push([]);
        atlases[1].push([]);

        for (let i = 0; i < atlasFilenames[0][0].length; i++) {

            let atlasRGBA, atlasZ;

            if ( compression ) {

                atlasRGBA = await ktx2Loader.loadAsync(atlasFilenames[0][perspective][i],
                    function (atlas) {

                        atlas.encoding = THREE.sRGBEncoding;

                    },
                    undefined,
                    function (error) {
                        console.log('An error happened while loading an atlas!: ' + error);
                    }
                );

                atlasZ = await ktx2Loader.loadAsync( "zBuffer/" + atlasFilenames[1][perspective][i],
                    function (atlas) {

                        // atlas.encoding = THREE.sRGBEncoding;

                    },
                    undefined,
                    function (error) {
                        console.log('An error happened while loading an atlas!: ' + error);
                    }
                );

            } else {

                atlasRGBA = await textureLoader.loadAsync( atlasFilenames[0][perspective][i]              );
                atlasZ    = await textureLoader.loadAsync( "zBuffer/" + atlasFilenames[1][perspective][i] );

            }

            // atlasRGBA.anisotropy = 8;
            // atlasZ.anisotropy    = 8;

            atlases[0][perspective].push( atlasRGBA );
            atlases[1][perspective].push( atlasZ    );

        }

        // disposes the loader object, de-allocating any Web Workers created.
        ktx2Loader.dispose();

    }

    return atlases;
}

function setDummyFilenames( compression ) {

    if ( compression ) {

        atlasFilenames = [
            [
                [
                    "F_1_16.ktx2",
                    "F_17_32.ktx2",
                    "F_33_48.ktx2",
                    "F_49_64.ktx2",
                    "F_65_80.ktx2",
                    "F_81_96.ktx2",
                    "F_97_112.ktx2",
                    "F_113_128.ktx2",
                    "F_129_144.ktx2",
                    "F_145_160.ktx2",
                    "F_161_176.ktx2",
                    "F_177_180.ktx2"
                ],
                [
                    "R_1_16.ktx2",
                    "R_17_32.ktx2",
                    "R_33_48.ktx2",
                    "R_49_64.ktx2",
                    "R_65_80.ktx2",
                    "R_81_96.ktx2",
                    "R_97_112.ktx2",
                    "R_113_128.ktx2",
                    "R_129_144.ktx2",
                    "R_145_160.ktx2",
                    "R_161_176.ktx2",
                    "R_177_180.ktx2"
                ],
                [
                    "B_1_16.ktx2",
                    "B_17_32.ktx2",
                    "B_33_48.ktx2",
                    "B_49_64.ktx2",
                    "B_65_80.ktx2",
                    "B_81_96.ktx2",
                    "B_97_112.ktx2",
                    "B_113_128.ktx2",
                    "B_129_144.ktx2",
                    "B_145_160.ktx2",
                    "B_161_176.ktx2",
                    "B_177_180.ktx2"
                ],
                [
                    "L_1_16.ktx2",
                    "L_17_32.ktx2",
                    "L_33_48.ktx2",
                    "L_49_64.ktx2",
                    "L_65_80.ktx2",
                    "L_81_96.ktx2",
                    "L_97_112.ktx2",
                    "L_113_128.ktx2",
                    "L_129_144.ktx2",
                    "L_145_160.ktx2",
                    "L_161_176.ktx2",
                    "L_177_180.ktx2"
                ]
            ],
            [
                [
                    "ZF_1_16.ktx2",
                    "ZF_17_32.ktx2",
                    "ZF_33_48.ktx2",
                    "ZF_49_64.ktx2",
                    "ZF_65_80.ktx2",
                    "ZF_81_96.ktx2",
                    "ZF_97_112.ktx2",
                    "ZF_113_128.ktx2",
                    "ZF_129_144.ktx2",
                    "ZF_145_160.ktx2",
                    "ZF_161_176.ktx2",
                    "ZF_177_180.ktx2"
                ],
                [
                    "ZR_1_16.ktx2",
                    "ZR_17_32.ktx2",
                    "ZR_33_48.ktx2",
                    "ZR_49_64.ktx2",
                    "ZR_65_80.ktx2",
                    "ZR_81_96.ktx2",
                    "ZR_97_112.ktx2",
                    "ZR_113_128.ktx2",
                    "ZR_129_144.ktx2",
                    "ZR_145_160.ktx2",
                    "ZR_161_176.ktx2",
                    "ZR_177_180.ktx2"
                ],
                [
                    "ZB_1_16.ktx2",
                    "ZB_17_32.ktx2",
                    "ZB_33_48.ktx2",
                    "ZB_49_64.ktx2",
                    "ZB_65_80.ktx2",
                    "ZB_81_96.ktx2",
                    "ZB_97_112.ktx2",
                    "ZB_113_128.ktx2",
                    "ZB_129_144.ktx2",
                    "ZB_145_160.ktx2",
                    "ZB_161_176.ktx2",
                    "ZB_177_180.ktx2"
                ],
                [
                    "ZL_1_16.ktx2",
                    "ZL_17_32.ktx2",
                    "ZL_33_48.ktx2",
                    "ZL_49_64.ktx2",
                    "ZL_65_80.ktx2",
                    "ZL_81_96.ktx2",
                    "ZL_97_112.ktx2",
                    "ZL_113_128.ktx2",
                    "ZL_129_144.ktx2",
                    "ZL_145_160.ktx2",
                    "ZL_161_176.ktx2",
                    "ZL_177_180.ktx2"
                ]
            ]
        ];
    } else {

        atlasFilenames = [
            [
                [
                    "F_1_16.png",
                    "F_17_32.png",
                    "F_33_48.png",
                    "F_49_64.png",
                    "F_65_80.png",
                    "F_81_96.png",
                    "F_97_112.png",
                    "F_113_128.png",
                    "F_129_144.png",
                    "F_145_160.png",
                    "F_161_176.png",
                    "F_177_180.png"
                ],
                [
                    "R_1_16.png",
                    "R_17_32.png",
                    "R_33_48.png",
                    "R_49_64.png",
                    "R_65_80.png",
                    "R_81_96.png",
                    "R_97_112.png",
                    "R_113_128.png",
                    "R_129_144.png",
                    "R_145_160.png",
                    "R_161_176.png",
                    "R_177_180.png"
                ],
                [
                    "B_1_16.png",
                    "B_17_32.png",
                    "B_33_48.png",
                    "B_49_64.png",
                    "B_65_80.png",
                    "B_81_96.png",
                    "B_97_112.png",
                    "B_113_128.png",
                    "B_129_144.png",
                    "B_145_160.png",
                    "B_161_176.png",
                    "B_177_180.png"
                ],
                [
                    "L_1_16.png",
                    "L_17_32.png",
                    "L_33_48.png",
                    "L_49_64.png",
                    "L_65_80.png",
                    "L_81_96.png",
                    "L_97_112.png",
                    "L_113_128.png",
                    "L_129_144.png",
                    "L_145_160.png",
                    "L_161_176.png",
                    "L_177_180.png"
                ]
            ],
            [
                [
                    "ZF_1_16.png",
                    "ZF_17_32.png",
                    "ZF_33_48.png",
                    "ZF_49_64.png",
                    "ZF_65_80.png",
                    "ZF_81_96.png",
                    "ZF_97_112.png",
                    "ZF_113_128.png",
                    "ZF_129_144.png",
                    "ZF_145_160.png",
                    "ZF_161_176.png",
                    "ZF_177_180.png"
                ],
                [
                    "ZR_1_16.png",
                    "ZR_17_32.png",
                    "ZR_33_48.png",
                    "ZR_49_64.png",
                    "ZR_65_80.png",
                    "ZR_81_96.png",
                    "ZR_97_112.png",
                    "ZR_113_128.png",
                    "ZR_129_144.png",
                    "ZR_145_160.png",
                    "ZR_161_176.png",
                    "ZR_177_180.png"
                ],
                [
                    "ZB_1_16.png",
                    "ZB_17_32.png",
                    "ZB_33_48.png",
                    "ZB_49_64.png",
                    "ZB_65_80.png",
                    "ZB_81_96.png",
                    "ZB_97_112.png",
                    "ZB_113_128.png",
                    "ZB_129_144.png",
                    "ZB_145_160.png",
                    "ZB_161_176.png",
                    "ZB_177_180.png"
                ],
                [
                    "ZL_1_16.png",
                    "ZL_17_32.png",
                    "ZL_33_48.png",
                    "ZL_49_64.png",
                    "ZL_65_80.png",
                    "ZL_81_96.png",
                    "ZL_97_112.png",
                    "ZL_113_128.png",
                    "ZL_129_144.png",
                    "ZL_145_160.png",
                    "ZL_161_176.png",
                    "ZL_177_180.png"
                ]
            ]
        ];

    }

}

//takes in the hdri name and the resolution and adds hdri to scene
export function loadHDRI(hdriController, scene){
    if(hdriController.texture == 'none'){
        scene.background = null;
        scene.environment = null;
    }
    else{
        var hdriLoader = new RGBELoader();
        hdriLoader.setPath('/assets/textures/hdri/');
        hdriLoader.load(hdriController.texture + '_' + hdriController.resolution + '.hdr', function(texture){
            texture.mapping = THREE.EquirectangularReflectionMapping;
            if(hdriController.background == true){
                scene.background = texture;
            }
            if(hdriController.background == false){
                scene.background = null;
            }
            if(hdriController.lighting == true){
                scene.environment = texture;
            }
            if(hdriController.lighting == false){
                scene.environment = null;
            }
        },
        //called when loading is in progresses
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        //called when loading has errors
        function ( error ) {
            console.log( 'An error happened while loading the HDRI texture!' );
        }
        );
    }
}
//changes effect of hdri on lighting or background
export function changeHDRI(hdriController, scene){
    if(hdriController.background == true){       
        //check if hdri is set as environment/lighting map, so that it doesn't need to be loaded twice
        if(scene.environment != null && scene.environment != 'undefined'){
            scene.background = scene.environment;
        }
        //when hdri is not loaded as environment/lighting map, hdri needs to be reloaded
        else{
            var hdriLoader = new RGBELoader();
            hdriLoader.setPath('/assets/textures/hdri/');
            hdriLoader.load(hdriController.texture + '_' + hdriController.resolution + '.hdr', function(texture){ 
                texture.mapping = THREE.EquirectangularReflectionMapping;
                scene.background = texture;
            });
        }
    }

    if(hdriController.background == false){
        scene.background = null;
    }

    if(hdriController.lighting == true){
        //check if hdri is set as background map, so that it doesn't need to be loaded twice
        if(scene.background != null && scene.background != 'undefined'){
            scene.environment = scene.background;
        }
        //when hdri is not loaded as background map, hdri needs to be reloaded
        else{
            var hdriLoader = new RGBELoader();
            hdriLoader.setPath('/assets/textures/hdri/');
            hdriLoader.load(hdriController.texture + '_' + hdriController.resolution + '.hdr', function(texture){ 
                texture.mapping = THREE.EquirectangularReflectionMapping;
                scene.environment = texture;
            });
        }
    }

    if(hdriController.lighting == false){
        scene.environment = null;
    }
}
//takes in the object name and adds it to the scene and object list
export function loadObject(objectController, scene, objects){
    var objectLoader = new GLTFLoader();
    objectLoader.setPath('/assets/models/')
    objectLoader.load(objectController.objectType.toLowerCase() + '.glb',
        //called when resource is loaded
	    function ( gltf ) {
            gltf.scene.name = objectController.objectType;
	    	scene.add( gltf.scene );
            objects.elements.push( gltf.scene );
	    },
	    //called when loading is in progresses
	    function ( xhr ) {
		    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	    },
	    //called when loading has errors
	    function ( error ) {
		    console.log( 'An error happened' );
	    }
    );
}

//takes in the object name and adds it to the scene as the only object, deletes other objects
export function loadObjectAsOnly(objectController, scene, objects){
    removeAllObjectsFromScene(scene, objects);
    if(objectController.objectType !== 'none'){
        var objectLoader = new GLTFLoader();
        objectLoader.setPath('/assets/models/')
        objectLoader.load(objectController.objectType.toLowerCase() + '.glb',
            //called when resource is loaded
	        function ( gltf ) {
                gltf.scene.material = new THREE.MeshPhysicalMaterial({
                    roughness: 0.35,
                    metalness: 0.45,
                    reflectivity: 0.55,
                    clearcoatRoughness: 1,
                    flatShading: false,
                })
                gltf.scene.name = objectController.objectType.toLowerCase();
                gltf.scene.position.set(0, 0.5, 0);
                gltf.scene.scale.set(0.5, 0.5, 0.5)
	    	    scene.add( gltf.scene );
                objects.elements.push(gltf.scene);
	        },
	        //called when loading is in progresses
	        function ( xhr ) {
		        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	        },
	        //called when loading has errors
	        function ( error ) {
		        console.error( 'An error happened while loading the object: ' + error);
	        }
        );
    }
    
}

export function removeAllObjectsFromScene(scene, objects){
    for(let i = objects.elements.length - 1; i >= 0; i--){
        scene.remove(objects.elements[i]);
    }
    objects.elements = [];
}
