import '../style.css';
import * as THREE from 'three';
import UI  from './GUI.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import FirstPersonController from './FirstPersonController';
import OrbitController from './OrbitController.js';
import Fire from './Fire';
import {FontLoader, TextGeometry} from "three";
/*!
 *  @authors David Palm, Dennis Oberst
 *  Entry point of the application. Setup of the scene and rendering gets managed here.
 */
window.addEventListener('resize', onWindowResize, false);
window.addEventListener('pointerdown', onMouseDown, false);
window.addEventListener('pointerup', onMouseUp, false);
window.addEventListener('keydown', onKeyDown, false);
window.addEventListener('keyup', onKeyUp, false);
window.addEventListener('mousemove', onMouseMove, false);

export let renderer;
let scene, camera;
export let controller;
let gui;

let floor;
let ambientLight;

let fire = null;

let objects = {
    elements: [],
};
let selected;

let notifications = false;

// simulation capture cameras matrices: front -> [0], right -> [1], back -> [2], left -> [3]
let modelViewMats = [ new THREE.Matrix4(), new THREE.Matrix4(), new THREE.Matrix4(), new THREE.Matrix4()];
let projectionMats = [ new THREE.Matrix4(), new THREE.Matrix4(), new THREE.Matrix4(), new THREE.Matrix4()];

//create performance stats
const stats = Stats();
document.body.appendChild(stats.dom);

//initialising
function init() {
    initScene();
    initRendering();
    controller = new OrbitController(camera, renderer.domElement, scene, objects, selected);
    //create gui
    gui = new UI(scene, objects, floor, camera, ambientLight, renderer);
    update();
}

export function createTextAnimation() {
    const loader = new FontLoader();
    loader.load("/fonts/JB_Mono.json", function (font) {
        const geometry = new TextGeometry("Simulation Finished\nPress 'F' to enter", {
            font: font,
            size: 12,
            height: 0,
            bevelEnabled: true,
            bevelThickness: 2,
            bevelSize: 0.75,
            anchor: {x: 0.5, y: 0.0, z: 0.5}
        });
        geometry.computeBoundingBox();
        geometry.center();
        const material = new THREE.MeshBasicMaterial({
            color: '#6b2678',
            reflectivity: 0.5,
        });
        const mesh = new THREE.Mesh(geometry, material);
        //enable shadows
        mesh.castShadow = true;
        mesh.name = "notification"

        mesh.position.x -= 0;
        mesh.position.y += 3
        mesh.scale.set(0.05,0.05,0.05)
        notifications = true;
        scene.add(mesh);
    });
}

function initScene(){
    //creating and setting up camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set(10, 10, 10);
    //create scene
    scene = new THREE.Scene();
    //initialising objects and lights
    initObjects();
    initLights();
}

function initObjects(){
    //create floor
    floor = new THREE.Mesh(new THREE.BoxGeometry(10, 0.1, 10), new THREE.MeshStandardMaterial());
    scene.add(floor);

    //adding cube
}

function initLights(){
    ambientLight = new THREE.HemisphereLight(0xe0f3ff, 0xffc26e, 0.2);
    scene.add(ambientLight);
}

function initRendering(){
    //creating and setting up the renderer
    renderer = new THREE.WebGLRenderer( {antialias: true} );
    // renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    //set tonemapping
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    //enable shadows
    document.body.appendChild(renderer.domElement);
}

function switchToFPControls(){
    if(controller instanceof OrbitController){
        controller.destroy();
        gui.hide();
        controller = new FirstPersonController(camera, document);
        fire = new Fire( gui.getJSONController(), camera, scene, controller, modelViewMats, projectionMats );

        notifications = false;
        let notification = scene.getObjectByName("notification");
        scene.remove(notification);
    }
}

function switchToOrbitControls(){
    if(controller instanceof FirstPersonController){
        controller.destroy();
        gui.hide();
        controller = new OrbitController(camera, document.body, scene, objects, selected);
        fire.destroy();
        fire = null;
    }
    update();
}

function render() {
    renderer.render(scene, camera);
}

function update() {
    stats.update();
    controller.move();
    render();
    requestAnimationFrame(update);
    if(fire != null && fire != 'undefined'){
        fire.update();
    }
    if (notifications){
        let notification = scene.getObjectByName("notification");

        if(notification != null){
            notification.rotation.y += 0.008;
        }
    }
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();

}

function onMouseDown(event) {
   controller.onMouseDown(event);
}

function onMouseUp(event){
    controller.onMouseUp(event);
}

function onMouseMove(event){
    controller.onMouseMove(event);
}


function onKeyDown(event){
    controller.onKeyDown(event);
    switch(event.code){
        //change to fp controls
        case 'KeyF':
        console.log('switching to first person');
        switchToFPControls();
        break;

        case 'KeyO':
        console.log('switching to orbit');
        switchToOrbitControls();

        //switchToFPControls();
        break;
    }
}

function onKeyUp(event){
    controller.onKeyUp(event);
}

/**
 * Sets the capture camera matrices.
 * @param {number[][]} modelViews  - First dimension for camera, second for matrix.
 * @param {number[][]} projections - First dimension for camera, second for matrix.
 */
export function setMatrices( modelViews, projections ){

    for ( let p = 0; p < 4; p++ ) {
        modelViewMats[p].fromArray(modelViews[p])
        projectionMats[p].fromArray(projections[p])
    }

}

init();