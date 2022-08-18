import { GUI } from 'dat.gui'
import { ObjectSpaceNormalMap } from 'three';
import * as Loader from './Loader.js'
import * as WEBSOCKET from './websocket'
import {JoinNode} from "three/examples/jsm/nodes/utils/JoinNode";


//gui class takes in scene, objects and floor
export default class UI{
    #objects;
    #name_controller;
    constructor(scene, objects, floor, camera, ambientLight, renderer){
        if (document.cookie.length == 0){
            console.log("create first cookies")
            setCookie('wood', "floorTexture")
            setCookie(1, "floorRepeat")
            console.log(getCookie("floorTexture"))
            setCookie("1k", "floorResolution")
            setCookie(1, "floorFiltering")
            setCookie( true, "floorCompression")

            setCookie('field 3 [sunset][sunny]', "HDRITexture")
            setCookie(true, "HDRIBackground")
            setCookie(true, "HDRILighting")
            setCookie('1k', "HDRIResolution")

            setCookie('Cube', "objectType")
            setCookie(60, "cameraFov")

            setCookie(0.25, "lightIntensity")

            setCookie( true, "fireCompression")
            // setCookie(400, "fireResolutionX")
            // setCookie(400, "fireResolutionY")
            setCookie(512, "fireResolutionXY")
            // setCookie(20, "smokeDomainSizeX")
            // setCookie(20, "smokeDomainSizeY")
            // setCookie(20, "smokeDomainSizeZ")
            setCookie(2, "smokeDomainSizeXYZ")
            setCookie(1, "startFrame")
            setCookie(180, "endFrame")
            setCookie(30, "frameRate")
        }
        this.datgui = new GUI();
        this.#objects = objects;
        let that = this;

        let floorController = {
            texture: getCookie("floorTexture").toString(),
            resolution: getCookie("floorResolution").toString(),
            filtering: parseInt(getCookie("floorFiltering")),
            repeat: parseInt(getCookie("floorRepeat")),
            compression: (getCookie("floorCompression") === 'true' )
        }

        let hdriController = {
            texture: getCookie("HDRITexture").toString(),
            resolution: getCookie("HDRIResolution").toString().toString(),
            background: (getCookie("HDRIBackground") === 'true'),
            lighting: (getCookie("HDRILighting") === 'true')

        }

        let objectController = {
            objectType: getCookie("objectType").toString(),
            //objectType: "Cube",
            objectId: 1, /* todo: dynamic id*/
            activeObject: 'none',

             load: function () {
                Loader.loadObjectAsOnly(objectController, scene, objects);
                //Loader.loadObject(objectController, scene, that.#objects); //uncomment when loading multiple obj
                 /* this adds the loaded item to the gui list for selection! */
                 let list = [];
                 that.#objects.elements.forEach(function (item) {
                     list.push(item.name);
                 })
                 list.push(this.objectType);
                 that.#name_controller = that.#name_controller.options(list);
            }
        }

        let ambientLightController = {
            skyColor: 0xe0f3ff,
            groundColor: 0xffc26e,
            intensity: parseFloat(getCookie("lightIntensity"))
        }

        this.JSONController = {
            /*
            resolutionX: 400,
            resolutionY: 400,
            smokeDomainSizeX: 20,
            smokeDomainSizeY: 20,
            smokeDomainSizeZ: 20,
            frameRate: 30,
            startFrame: 1,
            endFrame: 180,
            */

            compression: (getCookie("fireCompression") === 'true'),
            // resolutionX: parseInt(getCookie("fireResolutionX")),
            // resolutionY: parseInt(getCookie("fireResolutionY")),
            resolutionXY: parseInt(getCookie("fireResolutionXY")),
            // smokeDomainSizeX: parseInt(getCookie("smokeDomainSizeX")),
            // smokeDomainSizeY: parseInt(getCookie("smokeDomainSizeY")),
            // smokeDomainSizeZ: parseInt(getCookie("smokeDomainSizeZ")),
            smokeDomainSizeXYZ: parseInt(getCookie("smokeDomainSizeXYZ")),
            frameRate: parseInt(getCookie("frameRate")),
            startFrame: parseInt(getCookie("startFrame")),
            endFrame: parseInt(getCookie("endFrame")),

            start: function(){
                let data = {
                    "compression": this.compression,
                    "frameRate": this.frameRate,
                    "startFrame": this.startFrame,
                    "endFrame": this.endFrame,
                    // "resolutionX": this.resolutionX,
                    // "resolutionY": this.resolutionY,
                    "resolutionXY": this.resolutionXY,
                    "fireResolution": 30,
                    "material": "wood",
                    // "smokeDomainSize": [
                    //     this.smokeDomainSizeX,
                    //     this.smokeDomainSizeY,
                    //     this.smokeDomainSizeZ
                    // ],
                    "smokeDomainSizeXYZ": this.smokeDomainSizeXYZ,
                    "objectType": objectController.activeObject,
                    "objectId": objectController.objectId,
                    "scale": [
                        /* todo: get val from active object */
                        1,
                        1,
                        1
                    ],
                    "location": [
                        /* todo: get val from active object */
                        0,
                        0,
                        1
                    ],
                    "rotation": [
                        /* todo: get val from active object */
                        0,
                        0,
                        0
                    ],
                    "forceType": "Wind",
                    "forceId": 1,
                    "forceScale": [
                        2,
                        2,
                        3
                    ],
                    "forceLocation": [
                        10,
                        0,
                        4
                    ],
                    "forceRotation": [
                        0,
                        270,
                        0
                    ]
                };
                WEBSOCKET.requestSimulation(data);
            }
        }


        //create floor folder
        this.floorFolder = this.datgui.addFolder('Floor');
            this.floorFolder.add(floorController, 'texture', ['none', 'wood', 'small tiles']).name('Texture').onChange(function() { onChangeFloor(floorController, floor, 'texture')});
            this.floorFolder.add(floorController, 'repeat', 0.2, 50).name('Repeat').onChange(function() { onChangeFloor(floorController, floor, 'repeat')});
            //create hdri folder
        this.hdriFolder = this.datgui.addFolder('HDRI');
            this.hdriFolder.add(hdriController, 'texture', ['none', 'apartment 1 [day][sunny]', 'apartment 2 [day][sunny]', 'apartment 3 [day][sunny]',
            'forrest 1 [day][overcast]', 'forrest 2 [day][sunny]', 'forrest 3 [day][sunny]', 'field 1 [sunrise][sunny]', 'field 2 [day][sunny]', 'field 3 [sunset][sunny]',
            'city 1 [day][sunny]', 'city 2 [day][overcast]', 'city 3 [night]']).name('Texture').onChange(function() { onChangeHDRI(hdriController, scene) });
            this.hdriFolder.add(hdriController, 'background').name('Use as background').onChange(function() { onChangeHDRI(hdriController, scene) });
            this.hdriFolder.add(hdriController, 'lighting').name('Use for lighting').onChange(function() { onChangeHDRI(hdriController, scene) });
        //create object folder       
        this.objectFolder = this.datgui.addFolder('Objects');
                this.objectFolder.add(objectController, 'objectType', ['none','Cube', 'Sphere', 'Suzanne']).name('Object').onChange(function(){onChangeObject(objectController)});
                this.objectFolder.add(objectController, 'load').name('Add object');
        //create settings folder
        this.settingsFolder = this.datgui.addFolder('Settings');
            this.cameraFolder = this.settingsFolder.addFolder('Camera');
                this.cameraFolder.add(camera, 'fov', 30, 90, 0.1).onChange(function(){ camera.updateProjectionMatrix()}).name('Fiel of view').onChange(function() {onChangeCameraSetting(camera)});
            this.graphicsFolder = this.settingsFolder.addFolder('Graphics');
                this.hdriSettingsFolder = this.graphicsFolder.addFolder('HDRI');
                    this.hdriSettingsFolder.add(hdriController, 'resolution', ['1k', '2k', '4k']).name('HDRI texture resolution').onChange(function() { onChangeHDRI(hdriController, scene) });
                this.floorSettingsFolder = this.graphicsFolder.addFolder('Floor')
                    this.floorCompressionFolder = this.floorSettingsFolder.addFolder('Texture Compression')
                        this.floorCompressionFolder.add(floorController, 'compression').name('Activate').onChange(function (){ onChangeFloor(floorController, floor, 'compression') });
                    this.floorSettingsFolder.add(floorController, 'resolution', ['1k', '2k']).name('Floor texture resolution').onChange(function() { onChangeFloor(floorController, floor, 'resolution') });
                    this.floorSettingsFolder.add(floorController, 'filtering', 1, renderer.capabilities.getMaxAnisotropy()).name('Anisotropic Filtering').onChange(function() { onChangeFloor(floorController, floor, 'filtering') });
        //create light folder
        this.lightFolder = this.datgui.addFolder('Light');
            this.ambientLightFolder = this.lightFolder.addFolder('Ambient light');
                this.ambientLightFolder.addColor(ambientLightController, 'skyColor').onChange(function(color) { ambientLight.skyColor = new THREE.Color(color); });
                this.ambientLightFolder.addColor(ambientLightController, 'groundColor').onChange(function(color) { ambientLight.groundColor = new THREE.Color(color); });
                this.ambientLightFolder.add(ambientLightController, 'intensity').onChange(function(value) { onChangeLight(ambientLight, value) });
        //create fire folder
        this.fireFolder = this.datgui.addFolder('Fire');
            this.#name_controller = this.fireFolder.add(objectController, 'activeObject', ["none"]).name('Select Object');
            this.fireCompressionFolder = this.fireFolder.addFolder('Texture Compression')
                this.fireCompressionFolder.add(that.JSONController, 'compression').name('Activate').onChange(function (){ onChangeFire(that.JSONController) });
            this.resolutionFolder = this.fireFolder.addFolder('Resolution');
                // this.resolutionFolder.add(that.JSONController, 'resolutionX', 20, 2000).name('Resolution X').onChange(function() { onChangeFire(that.JSONController)});
                // this.resolutionFolder.add(that.JSONController, 'resolutionY', 20, 2000).name('Resolution Y').onChange(function() { onChangeFire(that.JSONController)});
                this.resolutionFolder.add(that.JSONController, 'resolutionXY', { Low: 512, Medium: 1024, High: 2048 } ).onChange(function() { onChangeFire(that.JSONController)});
            this.smokeDomainFolder = this.fireFolder.addFolder('Smoke Domain Size');
                // this.smokeDomainFolder.add(that.JSONController, 'smokeDomainSizeX', 1, 100).name('Smoke Domain Size X').onChange(function() { onChangeFire(that.JSONController)});
                // this.smokeDomainFolder.add(that.JSONController, 'smokeDomainSizeY', 1, 100).name('Smoke Domain Size Y').onChange(function() { onChangeFire(that.JSONController)});
                // this.smokeDomainFolder.add(that.JSONController, 'smokeDomainSizeZ', 1, 100).name('Smoke Domain Size Z').onChange(function() { onChangeFire(that.JSONController)});
                this.smokeDomainFolder.add(that.JSONController, 'smokeDomainSizeXYZ', 1, 10).name('XYZ').onChange(function() { onChangeFire(that.JSONController)});
            this.framesFolder = this.fireFolder.addFolder('Frames');
                this.framesFolder.add(that.JSONController, 'startFrame', 1, 1000).name('Start Frame').onChange(function() { onChangeFire(that.JSONController)});
                this.framesFolder.add(that.JSONController, 'endFrame', this.getJSONController().startFrame, 1000).name('End Frame').onChange(function() { onChangeFire(that.JSONController)});
                this.framesFolder.add(that.JSONController, 'frameRate', 30, 60).name('Frame Rate').onChange(function() { onChangeFire(that.JSONController)});

        //simulation folder
        this.datgui.add(this.JSONController, 'start').name('Request Simulation');

        /* init floor */
        Loader.loadFloorMaterial(floorController, floor);
        Loader.loadHDRI(hdriController, scene);

        //checkCookie()

    }


    hide(){
        GUI.toggleHide();
    }
    show(){
        GUI.toggleShow();
    }

    getJSONController() {
        return this.JSONController;
    }

    setJSONController(JSONController) {
        UI.JSONController = JSONController


    }

    /* private function that returns a list of all objects in the scene */
    #getObjectNames() {
        let list = [];
        this.#objects.elements.forEach(function (item) {
            list.push(item.name);
        })
        console.log("list is: " + list);
        return list;
    }




}
// Jonas Max functions for the cookie implementation



function setCookie(data, type) {
    const d = new Date();
    d.setTime(d.getTime() + (20000*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = type + "=" + data + ";" + expires + ";path=/";

}

function getCookie(data) {
    let name = data + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function onChangeFloor(floorController, floor, change = ''){
    //loader function
    Loader.loadFloorMaterial(floorController, floor, change)
    //server sending
    setCookie(floorController.texture, "floorTexture")
    setCookie(floorController.repeat, "floorRepeat")
    setCookie(floorController.resolution, "floorResolution")
    setCookie(floorController.filtering, "floorFiltering")
    setCookie(floorController.compression, "floorCompression")
}

function onChangeHDRI(hdriController, scene){
    //loader function
    Loader.loadHDRI(hdriController, scene)
    //server sending
    setCookie(hdriController.texture, "HDRITexture")
    setCookie(hdriController.background, "HDRIBackground")
    setCookie(hdriController.lighting, "HDRILighting")
    setCookie(hdriController.resolution, "HDRIResolution")
}
function onChangeObject(objectController){
    //server sending
    setCookie(objectController.objectType, "objectType")

}

function onChangeCameraSetting(camera){
    //server sending
    setCookie(camera.fov, "cameraFov")
}

function onChangeLight(ambientLight, value){
    // loader Function
    ambientLight.intensity = value;
    //server sending
    setCookie(ambientLight.intensity, "lightIntensity")
}

function onChangeFire(JSONController){
    //server sending
    setCookie(JSONController.compression, "fireCompression")
    // setCookie(JSONController.resolutionX, "fireResolutionX")
    // setCookie(JSONController.resolutionY, "fireResolutionY")
    setCookie(JSONController.resolutionXY, "fireResolutionXY")
    // setCookie(JSONController.smokeDomainSizeX, "smokeDomainSizeX")
    // setCookie(JSONController.smokeDomainSizeY, "smokeDomainSizeY")
    // setCookie(JSONController.smokeDomainSizeZ, "smokeDomainSizeZ")
    setCookie(JSONController.smokeDomainSizeXYZ, "smokeDomainSizeXYZ")
    setCookie(JSONController.startFrame, "startFrame")
    setCookie(JSONController.endFrame, "endFrame")
    setCookie(JSONController.frameRate, "frameRate")

    console.log(JSONController.resolutionXY)
}
