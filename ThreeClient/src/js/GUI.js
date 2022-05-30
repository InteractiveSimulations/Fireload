import { GUI } from 'dat.gui'
import * as Loader from './Loader.js'

//gui class takes in scene, objects and floor
export default class UI{
    constructor(scene, objects, floor, camera, ambientLight, renderer){

        this.datgui = new GUI();

        var floorController = {
            texture: 'none',
            resolution: '1k',
            filtering: 1,
            repeat: 1
        }
        var hdriController = {
            texture: 'none',
            resolution: '1k',
            background: true,
            lighting: true
        }      
        var objectController = {
            object: 'cube',
            load: function(){ Loader.loadObject(objectController, scene, objects) }
        }
        var ambientLightController = {
            skyColor: 0xe0f3ff,
            groundColor: 0xffc26e,
            intensity: 0.2
        }
        var JSONController = {
            start: function(){  }
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
            this.furnitureFolder = this.objectFolder.addFolder('Furniture');
                this.furnitureFolder.add(objectController, 'object', ['none', 'cube', 'sphere', 'suzanne']).name('Object');
                this.furnitureFolder.add(objectController, 'load').name('Add object');       
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
        //simulation folder
        this.datgui.add(JSONController, 'start').name('Start simulation');   
    }

    hide(){
        GUI.toggleHide();
    }
}