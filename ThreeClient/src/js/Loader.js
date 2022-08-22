import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader";
import * as THREE from 'three';
import * as SCRIPT from './script'

export let atlasFilenames = [];

//takes in texture name and resolution and sets texture as floor texture
export function loadFloorMaterial(floorController, floor, change = ''){

    if( floor.material.map == null || change === 'texture' || change === 'resolution' || change === 'compression' ) {

        if (floorController.texture == 'none') {

            //standard material is applied when none is chosen
            floor.material = new THREE.MeshStandardMaterial();

        } else {

            const textureLoader = new THREE.TextureLoader();
            textureLoader.setPath('assets/textures/floor/');

            const ktx2Loader = new KTX2Loader();
            ktx2Loader.setPath('assets/textures/floor/');
            ktx2Loader.setTranscoderPath('libs/basis/');
            ktx2Loader.detectSupport(SCRIPT.renderer);

            console.log(floorController.texture + '-diffuse_' + floorController.resolution + '.png');

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
                    //called when loading is in progresses
                    function (texture) {

                        texture.encoding = THREE.sRGBEncoding;

                        console.info(`transcoded to ${formatStrings[texture.format]}\n
                                        Of Type CompressedTexture: ` + texture.isCompressedTexture);

                    },
                    undefined,
                    function (error) {
                        console.log('An error happened while loading the floor diffuse texture!: ' + error);
                    }
                );

                //loading normal map
                normal = ktx2Loader.load(floorController.texture + '-normal_' + floorController.resolution + '.ktx2',
                    //called when loading is in progresses
                    function (texture) {

                        // texture.encoding = THREE.sRGBEncoding;

                        console.info(`transcoded to ${formatStrings[texture.format]}\n
                                        Of Type CompressedTexture: ` + texture.isCompressedTexture);

                    },
                    undefined,
                    //called when loading has errors
                    function (error) {
                        console.log('An error happened while loading the floor normaltexture!');
                    }
                );

                roughness = ktx2Loader.load(floorController.texture + '-roughness_' + floorController.resolution + '.ktx2',
                    //called when loading is in progresses
                    function (texture) {

                        texture.encoding = THREE.sRGBEncoding;

                        console.info(`transcoded to ${formatStrings[texture.format]}\n
                                        Of Type CompressedTexture: ` + texture.isCompressedTexture);

                    },
                    //called when loading is in progresses
                    undefined,
                    function (error) {
                        console.log('An error happened while loading the floor diffuse texture!: ' + error);
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

            diffuse.wrapS = THREE.RepeatWrapping;
            diffuse.wrapT = THREE.RepeatWrapping;
            diffuse.repeat.set(floorController.repeat, floorController.repeat);
            diffuse.anisotropy = floorController.filtering;

            normal.wrapS = THREE.RepeatWrapping;
            normal.wrapT = THREE.RepeatWrapping;
            normal.repeat.set(floorController.repeat, floorController.repeat);
            normal.anisotropy = floorController.filtering;

            roughness.wrapS = THREE.RepeatWrapping;
            roughness.wrapT = THREE.RepeatWrapping;
            roughness.repeat.set(floorController.repeat, floorController.repeat);
            roughness.anisotropy = floorController.filtering;

            floor.material.map = diffuse;
            floor.material.normalMap = normal;
            floor.material.roughnessMap = roughness;

            floor.material.needsUpdate = true;

            ktx2Loader.dispose();

        }


    }

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

    if(change === 'filtering') {

        floor.material.map.anisotropy = floorController.filtering;
        floor.material.map.needsUpdate = true;

        floor.material.normalMap.anisotropy = floorController.filtering;
        floor.material.normalMap.needsUpdate = true;

        floor.material.roughnessMap.anisotropy = floorController.filtering;
        floor.material.roughnessMap.needsUpdate = true;

    }

}

export function loadFireFromFrames(JSONController){

    // Todo atlasse in zweidimensionales array laden

    let atlases = [[]];

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setPath('assets/simulations/');
    textureLoader.setPath('assets/simulations/')

    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setPath('assets/simulations/');
    ktx2Loader.setTranscoderPath('libs/basis/');
    ktx2Loader.detectSupport(SCRIPT.renderer);


    for(let i = 0; i <= atlasFilenames.length; i++){

        let atlasRGBA, atlasZ;

        if(JSONController.compression) {

            atlasRGBA = ktx2Loader.load(atlasFilenames[0][i],
                function (texture) {

                    texture.encoding = THREE.sRGBEncoding;

                },
                undefined,
                function (error) {
                    console.log('An error happened while loading the floor diffuse texture!: ' + error);
                }
            );

            atlasZ = ktx2Loader.load(atlasFilenames[1][i],
                function (atlas) {

                    atlas.encoding = THREE.sRGBEncoding;

                },
                undefined,
                function (error) {
                    console.log('An error happened while loading the floor diffuse texture!: ' + error);
                }
            );

        } else {

            atlasRGBA = textureLoader.load(atlasFilenames[0][i],
                function (texture) {
                },
                undefined,
                function (error) {
                    console.log('An error happened while loading the floor diffuse texture!: ' + error);
                }
            );

            atlasZ = textureLoader.load(atlasFilenames[1][i],
                function (atlas) {
                },
                undefined,
                function (error) {
                    console.log('An error happened while loading the floor diffuse texture!: ' + error);
                }
            );

        }

        atlasRGBA.anisotropy = 8;
        atlasZ.anisotropy = 8;

        atlases[0].push(atlasRGBA);
        atlases[1].push(atlasZ)

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
