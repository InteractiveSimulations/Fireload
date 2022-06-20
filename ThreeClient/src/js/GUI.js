import { GUI } from 'dat.gui'
import { ObjectSpaceNormalMap } from 'three';
import * as Loader from './Loader.js'
import * as WEBSOCKET from './websocket'

//gui class takes in scene, objects and floor
export default class UI{
    constructor(scene, objects, floor, camera, ambientLight, renderer){

        this.datgui = new GUI();

        let floorController = {
            texture: 'none',
            resolution: '1k',
            filtering: 1,
            repeat: 1
        }
        let hdriController = {
            texture: 'none',
            resolution: '1k',
            background: true,
            lighting: true
        }      
        let objectController = {
            objectType: 'cube',
            objectId: objects.length,

            load: function(){
                Loader.loadObjectAsOnly(objectController, scene, objects);
            }
        }
        let ambientLightController = {
            skyColor: 0xe0f3ff,
            groundColor: 0xffc26e,
            intensity: 0.2
        }
        let JSONController = {
            resolutionX: 400,
            resolutionY: 400,
            smokeDomainSizeX: 20,
            smokeDomainSizeY: 20,
            smokeDomainSizeZ: 20,

            start: function(){
                let data = {
                    "frameRate": 30,
                    "startFrame": 1,
                    "endFrame": 180,
                    "resolutionX": JSONController.resolutionX,
                    "resolutionY": JSONController.resolutionY,
                    "smokeDomainSize": [
                        JSONController.smokeDomainSizeX,
                        JSONController.smokeDomainSizeY,
                        JSONController.smokeDomainSizeZ
                    ],
                    "objectType": "Suzanne",
                    "objectId": "Suzanne",
                    "scale": [
                        //selectedObject.getSize();
                        1,
                        1,
                        1
                    ],
                    "location": [
                        0,
                        0,
                        1
                    ],
                    "rotation": [
                        0,
                        0,
                        0
                    ]
                };
                WEBSOCKET.requestSimulation(data);
            }
        }

        //create floor folder
        this.floorFolder = this.datgui.addFolder('Floor');
            this.floorFolder.add(floorController, 'texture', ['none', 'wood', 'small tiles']).name('Texture').onChange(function() { Loader.loadFloorMaterial(floorController, floor) });
            this.floorFolder.add(floorController, 'repeat', 0.2, 50).name('Repeat').onChange(function() { Loader.loadFloorMaterial(floorController, floor) });
        //create hdri folder
        this.hdriFolder = this.datgui.addFolder('HDRI');
            this.hdriFolder.add(hdriController, 'texture', ['none', 'apartment 1 [day][sunny]', 'apartment 2 [day][sunny]', 'apartment 3 [day][sunny]',
            'forrest 1 [day][overcast]', 'forrest 2 [day][sunny]', 'forrest 3 [day][sunny]', 'field 1 [sunrise][sunny]', 'field 2 [day][sunny]', 'field 3 [sunset][sunny]',
            'city 1 [day][sunny]', 'city 2 [day][overcast]', 'city 3 [night]']).name('Texture').onChange(function() { Loader.loadHDRI(hdriController, scene) });
            this.hdriFolder.add(hdriController, 'background').name('Use as background').onChange(function() { Loader.changeHDRI(hdriController, scene) });
            this.hdriFolder.add(hdriController, 'lighting').name('Use for lighting').onChange(function() { Loader.changeHDRI(hdriController, scene) });
        //create object folder       
        this.objectFolder = this.datgui.addFolder('Objects');
                this.objectFolder.add(objectController, 'objectType', ['none','cube', 'sphere', 'suzanne', 'table', 'tv']).name('Object');
                this.objectFolder.add(objectController, 'load').name('Add object');
        //create settings folder
        this.settingsFolder = this.datgui.addFolder('Settings');
            this.cameraFolder = this.settingsFolder.addFolder('Camera');
                this.cameraFolder.add(camera, 'fov', 30, 90, 0.1).onChange(function(){ camera.updateProjectionMatrix()}).name('Fiel of view');
            this.graphicsFolder = this.settingsFolder.addFolder('Graphics');
                this.hdriSettingsFolder = this.graphicsFolder.addFolder('HDRI'); 
                    this.hdriSettingsFolder.add(hdriController, 'resolution', ['1k', '2k', '4k']).name('HDRI texture resolution').onChange(function() { Loader.loadHDRI(hdriController, scene) });
                this.floorSettingsFolder = this.graphicsFolder.addFolder('Floor')
                    this.floorSettingsFolder.add(floorController, 'resolution', ['1k', '2k']).name('Floor texture resolution').onChange(function() { Loader.loadFloorMaterial(floorController, floor) });
                    this.floorSettingsFolder.add(floorController, 'filtering', 1, renderer.capabilities.getMaxAnisotropy()).name('Anisotropic Filtering').onChange(function() {Loader.loadFloorMaterial(floorController, floor) });
        //create light folder
        this.lightFolder = this.datgui.addFolder('Light');
            this.ambientLightFolder = this.lightFolder.addFolder('Ambient light');
                this.ambientLightFolder.addColor(ambientLightController, 'skyColor').onChange(function(color) { ambientLight.skyColor = new THREE.Color(color); });
                this.ambientLightFolder.addColor(ambientLightController, 'groundColor').onChange(function(color) { ambientLight.groundColor = new THREE.Color(color); });
                this.ambientLightFolder.add(ambientLightController, 'intensity').onChange(function(value) { ambientLight.intensity = value; });
        //create fire folder
        this.fireFolder = this.datgui.addFolder('Fire');
            this.resolutionFolder = this.fireFolder.addFolder('Resolution');
                this.resolutionFolder.add(JSONController, 'resolutionX', 20, 2000).name('Resolution X');
                this.resolutionFolder.add(JSONController, 'resolutionY', 20, 2000).name('Resolution Y');
            this.smokeDomainFolder = this.fireFolder.addFolder('Smoke Domain Size');
                this.smokeDomainFolder.add(JSONController, 'smokeDomainSizeX', 1, 100).name('Smoke Domain Size X');
                this.smokeDomainFolder.add(JSONController, 'smokeDomainSizeY', 1, 100).name('Smoke Domain Size Y');
                this.smokeDomainFolder.add(JSONController, 'smokeDomainSizeZ', 1, 100).name('Smoke Domain Size Z');
        //simulation folder
        this.datgui.add(JSONController, 'start').name('Start simulation');


    }

    hide(){
        GUI.toggleHide();
    }
    show(){
        GUI.toggleShow();
    }

    #getObjectNames() {

    }
}