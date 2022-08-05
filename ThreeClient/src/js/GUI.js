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
    checkCookie();
        this.datgui = new GUI();
        this.#objects = objects;
        let that = this;

        let floorController = {
            texture: 'wood,',
            resolution: '1k',
            filtering: 1,
            repeat: 1
        }
        /*
        cookieFunction('wood', "floorTexture")
        cookieFunction('1k', "floorRepeat")
        cookieFunction(1, "floorResolution")
        cookieFunction(1, "floorFiltering")
        */
        let hdriController = {
            texture: 'field 3 [sunset][sunny]',
            resolution: '1k',
            background: true,
            lighting: true
        }
        /*
        cookieFunction('field 3 [sunset][sunny]', "HDRITexture")
        cookieFunction('1k', "HDRIBackground")
        cookieFunction(true, "HDRILighting")
        cookieFunction(true, "HDRIResolution")
        */

        let objectController = {
            objectType: 'Cube',
            objectId: 1, /* todo: dynamic id*/
            activeObject: 'none',

            load: function(){
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
        /*
        cookieFunction('Cube', "objectType")
        cookieFunction(60, "cameraFov")
         */
        let ambientLightController = {
            skyColor: 0xe0f3ff,
            groundColor: 0xffc26e,
            intensity: 0.25
        }
        /*
        cookieFunction(0.25, "lightIntensity")
         */

        let JSONController = {
            resolutionX: 400,
            resolutionY: 400,
            smokeDomainSizeX: 20,
            smokeDomainSizeY: 20,
            smokeDomainSizeZ: 20,
            frameRate: 30,
            startFrame: 1,
            endFrame: 180,

            start: function(){
                let data = {
                    "frameRate": this.frameRate,
                    "startFrame": this.startFrame,
                    "endFrame": this.endFrame,
                    "resolutionX": this.resolutionX,
                    "resolutionY": this.resolutionY,
                    "fireResolution": 30,
                    "material": "wood",
                    "smokeDomainSize": [
                        this.smokeDomainSizeX,
                        this.smokeDomainSizeY,
                        this.smokeDomainSizeZ
                    ],
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
        /*
        cookieFunction(400, "fireResolutionX")
        cookieFunction(400, "fireResolutionY")
        cookieFunction(20, "smokeDomainSizeX")
        cookieFunction(20, "smokeDomainSizeY")
        cookieFunction(20, "smokeDomainSizeZ")
        cookieFunction(1, "startFrame")
        cookieFunction(180, "endFrame")
        cookieFunction(30, "frameRate")
         */


        //create floor folder
        this.floorFolder = this.datgui.addFolder('Floor');
            this.floorFolder.add(floorController, 'texture', ['none', 'wood', 'small tiles']).name('Texture').onChange(function() { onChangeFloor(floorController, floor)});
            this.floorFolder.add(floorController, 'repeat', 0.2, 50).name('Repeat').onChange(function() { onChangeFloor(floorController, floor)});
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
                    this.floorSettingsFolder.add(floorController, 'resolution', ['1k', '2k']).name('Floor texture resolution').onChange(function() { onChangeFloor(floorController, floor) });
                    this.floorSettingsFolder.add(floorController, 'filtering', 1, renderer.capabilities.getMaxAnisotropy()).name('Anisotropic Filtering').onChange(function() { onChangeFloor(floorController, floor) });
        //create light folder
        this.lightFolder = this.datgui.addFolder('Light');
            this.ambientLightFolder = this.lightFolder.addFolder('Ambient light');
                this.ambientLightFolder.addColor(ambientLightController, 'skyColor').onChange(function(color) { ambientLight.skyColor = new THREE.Color(color); });
                this.ambientLightFolder.addColor(ambientLightController, 'groundColor').onChange(function(color) { ambientLight.groundColor = new THREE.Color(color); });
                this.ambientLightFolder.add(ambientLightController, 'intensity').onChange(function(value) { onChangeLight(ambientLight, value) });
        //create fire folder
        this.fireFolder = this.datgui.addFolder('Fire');
            this.#name_controller = this.fireFolder.add(objectController, 'activeObject', ["none"]).name('Select Object');
            this.resolutionFolder = this.fireFolder.addFolder('Resolution');
                this.resolutionFolder.add(JSONController, 'resolutionX', 20, 2000).name('Resolution X').onChange(function(value) { onChangeFire(JSONController)});
                //this.resolutionFolder.add(this.JSONController, 'resolutionX', 20, 2000).name('Resolution X');
                this.resolutionFolder.add(JSONController, 'resolutionY', 20, 2000).name('Resolution Y');
            this.smokeDomainFolder = this.fireFolder.addFolder('Smoke Domain Size');
                this.smokeDomainFolder.add(JSONController, 'smokeDomainSizeX', 1, 100).name('Smoke Domain Size X');
                this.smokeDomainFolder.add(JSONController, 'smokeDomainSizeY', 1, 100).name('Smoke Domain Size Y');
                this.smokeDomainFolder.add(JSONController, 'smokeDomainSizeZ', 1, 100).name('Smoke Domain Size Z');
            this.framesFolder = this.fireFolder.addFolder('Frames');
                this.framesFolder.add(JSONController, 'startFrame', 1, 1000).name('Start Frame');
                this.framesFolder.add(JSONController, 'endFrame', JSONController.startFrame, 1000).name('End Frame');
                this.framesFolder.add(JSONController, 'frameRate', 30, 60).name('Frame Rate');

        //simulation folder
        this.datgui.add(JSONController, 'start').name('Start simulation');

        /* init floor */
        Loader.loadFloorMaterial(floorController, floor);
        Loader.loadHDRI(hdriController, scene);
    }

    hide(){
        GUI.toggleHide();
    }
    show(){
        GUI.toggleShow();
    }

    getJSONController() {
        return JSONController;
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

/*function cookieFunction(data, type){
    const name = type;
    const value = data;
    const dictValues = {name, value}
    const s = JSON.stringify(dictValues);
    console.log(s)
}
*/

function cookieFunction(data, type) {
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

function checkCookie() {
    let username = getCookie("objectType");
    if (username != "") {
        //alert("Welcome again " + username);
        //change the objecttype in objectcontroller
    } else {
        username = prompt("Please enter your name:", "");
        if (username != "" && username != null) {
            setCookie("username", username, 365);
        }
    }
}
function onChangeFloor(floorController, floor){
    //loader function
    Loader.loadFloorMaterial(floorController, floor)
    //server sending
    cookieFunction(floorController.texture, "floorTexture")
    cookieFunction(floorController.repeat, "floorRepeat")
    cookieFunction(floorController.resolution, "floorResolution")
    cookieFunction(floorController.filtering, "floorFiltering")
}

function onChangeHDRI(hdriController, scene){
    //loader function
    Loader.loadHDRI(hdriController, scene)
    //server sending
    cookieFunction(hdriController.texture, "HDRITexture")
    cookieFunction(hdriController.background, "HDRIBackground")
    cookieFunction(hdriController.lighting, "HDRILighting")
    cookieFunction(hdriController.resolution, "HDRIResolution")
}
function onChangeObject(objectController){
    //server sending
    cookieFunction(objectController.objectType, "objectType")

}

function onChangeCameraSetting(camera){
    //server sending
    cookieFunction(camera.fov, "cameraFov")
}

function onChangeLight(ambientLight, value){
    // loader Function
    ambientLight.intensity = value;
    //server sending
    cookieFunction(ambientLight.intensity, "lightIntensity")
}

function onChangeFire(JSONController){
    //server sending
    //console.log("test");
    cookieFunction(JSONController.resolutionX, "fireResolutionX")
    cookieFunction(JSONController.resolutionY, "fireResolutionY")
    cookieFunction(JSONController.smokeDomainSizeX, "smokeDomainSizeX")
    cookieFunction(JSONController.smokeDomainSizeY, "smokeDomainSizeY")
    cookieFunction(JSONController.smokeDomainSizeZ, "smokeDomainSizeZ")
    cookieFunction(JSONController.startFrame, "startFrame")
    cookieFunction(JSONController.endFrame, "endFrame")
    cookieFunction(JSONController.frameRate, "frameRate")
}