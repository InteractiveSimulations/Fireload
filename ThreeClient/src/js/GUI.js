import { DAT_GUI } from 'dat.gui'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";
import * as THREE from "three";

/// @file GUI.js
/// @namespace Sync
/// Module for loading and storing data
class GUI {
    #gui; //make it private
    #scene;
    #renderer;
    #hdriLoader;

    #floorFolder;
    #hdriFolder;
    #objectFolder;
    #furnitureFolder;
    #settingsFolder;
    #cameraFolder;
    #graphicsFolder;
    #lightFolder;
    #ambientLightFolder;

    #floorController;
    #objController;
    #hdriController;

    constructor(renderer, scene) {
        this.#gui = new DAT_GUI();
        this.#hdriLoader = new RGBELoader();
        this.#renderer = renderer;
        this.#scene = scene;

        this.#floorController = {
            texture: 'none',
            resolution: '1k',
            repeat: 1,
        }
        this.#hdriController = {
            texture: 'none',
            resolution: '1k'
        }
        this.#objController = {
            object: 'table',
            load: this.loadObject
        }
    }
    init() {
        this.#floorFolder = this.#gui.addFolder('Floor');
        this.#floorFolder.add(floorController, 'texture', ['none', 'wood', 'small tiles']).name('Texture').onChange(loadFloorMaterial);
        this.#floorFolder.add(floorController, 'repeat', 0.2, 50).name('Repeat').onChange(loadFloorMaterial);
    }
    /// @function GUI.loadObject
    /// Loads an Object
    /// @param {Number} the Object Number
    /// Loads an resource
    loadObject(objectId){
        let objectLoader = new GLTFLoader();
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


    //takes in the hdri name and the resolution and adds hdri to scene
    loadHDRI(controller, hdriName, resolution){
        if(this.#hdriController.texture === 'none'){
            this.#scene.background = null;
            this.#scene.environment = null;
        }
        else{
            this.#hdriLoader = new RGBELoader();
            this.#hdriLoader.setPath('/assets/textures/hdri/');
            this.#hdriLoader.load(controller.texture + '_' + controller.resolution + '.hdr', function(texture){
                    texture.mapping = THREE.EquirectangularReflectionMapping;
                    this.#scene.background = texture;
                    this.#scene.environment = texture;
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
        render();
        this.#rendererq
    }
}