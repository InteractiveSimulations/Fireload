import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import UI  from './GUI.js'
import * as THREE from 'three'
//takes in texture name and resolution and sets texture as floor texture
export function loadFloorMaterial(floorController, floor){
    //standard material is applied when none is chosen
    if(floorController.texture == 'none'){
        floor.material = new THREE.MeshStandardMaterial();
    }
    else{
        
        var textureLoader = new THREE.TextureLoader();
        textureLoader.setPath('assets/textures/floor/');

        console.log(floorController.texture + '-diffuse_' + floorController.resolution + '.png');

        //loading albedo/diffuse map
        var diffuse = textureLoader.load(floorController.texture + '-diffuse_' + floorController.resolution + '.png',
        //called when loading is in progresses
        function ( texture ) {
            console.log( ( texture.loaded / texture.total * 100 ) + '% loaded' );
        },
        //called when loading has errors
        function ( error ) {
            console.log( 'An error happened while loading the floor diffuse texture!' );
        }
        );

        diffuse.wrapS = THREE.RepeatWrapping;
        diffuse.wrapT = THREE.RepeatWrapping;
        diffuse.repeat.set(floorController.repeat, floorController.repeat);
        diffuse.anisotropy = floorController.filtering;

        //loading normal map
        var normal = textureLoader.load(floorController.texture + '-normal_' + floorController.resolution + '.png',
        //called when loading is in progresses
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        //called when loading has errors
        function ( error ) {
            console.log( 'An error happened while loading the floor normaltexture!' );
        }
        );

        normal.wrapS = THREE.RepeatWrapping;
        normal.wrapT = THREE.RepeatWrapping;
        normal.repeat.set(floorController.repeat, floorController.repeat);  
        normal.anisotropy = floorController.filtering;

        //loading roughness map
        var roughness = textureLoader.load(floorController.texture + '-roughness_' + floorController.resolution + '.png',
        //called when loading is in progresses
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        //called when loading has errors
        function ( error ) {
            console.log( 'An error happened while loading the floor rougness texture!' );
        }
        );

        roughness.wrapS = THREE.RepeatWrapping;
        roughness.wrapT = THREE.RepeatWrapping;
        roughness.repeat.set(floorController.repeat, floorController.repeat);
        roughness.anisotropy = floorController.filtering;

        // immediately use the texture for material creation
        floor.material =  new THREE.MeshStandardMaterial( { map: diffuse, normalMap: normal, roughnessMap: roughness} );
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
    objectLoader.load(objectController.object + '.glb', 
        //called when resource is loaded
	    function ( gltf ) {
	    	scene.add( gltf.scene );
            objects.push( gltf.scene );
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
export function loadObjectAsOnly(objectController, scene, object){
    if(objectController.object == 'none'){
        console.log('none')
        scene.remove( object );
        object = null;
    }
    else{
    var objectLoader = new GLTFLoader();
    objectLoader.setPath('/assets/models/')
    objectLoader.load(objectController.object + '.glb', 
        //called when resource is loaded
	    function ( gltf ) {
            scene.remove(object);
            object = gltf.scene;
            console.log(object);
	    	scene.add( gltf.scene );
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
    
}