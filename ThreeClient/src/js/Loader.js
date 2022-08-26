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
 * @param {boolean} compression - if atlases were compressed by the server.
 * @return {THREE.Texture[[[]]]} - three-dimensional Texture array which holds all simulation atlases for
 * a combination RGBA or Z and capture camera perspective.
 * first dimension: RGBA -> [0], Z -> [1]
 * second dimension: front -> [0], right -> [1], back -> [2], left -> [3]
 * third dimension: atlases with simulation frames
 */
export async function loadFireAtlases(compression ){

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

    // atlasFilenames = [
    //     [
    //         [
    //             "F_1_64.png"
    //         ],
    //         [
    //             "R_1_64.png"
    //         ],
    //         [
    //             "B_1_64.png"
    //         ],
    //         [
    //             "L_1_64.png"
    //         ]
    //     ],
    //     [
    //         [
    //             "ZF_1_64.png"
    //         ],
    //         [
    //             "ZR_1_64.png"
    //         ],
    //         [
    //             "ZB_1_64.png"
    //         ],
    //         [
    //             "ZL_1_64.png"
    //         ]
    //     ]
    // ];

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

                atlasZ = await ktx2Loader.loadAsync( "zBuffer" + atlasFilenames[1][perspective][i],
                    function (atlas) {

                        atlas.encoding = THREE.sRGBEncoding;

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

            atlasRGBA.anisotropy = 8;
            atlasZ.anisotropy    = 8;

            atlases[0][perspective].push( atlasRGBA );
            atlases[1][perspective].push( atlasZ    );

        }

        // disposes the loader object, de-allocating any Web Workers created.
        ktx2Loader.dispose();

    }

    return atlases;
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
