import '../style.css';
import * as THREE from 'three';
import UI  from './GUI.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import FirstPersonController from './FirstPersonController';
import OrbitController from './OrbitController.js';
import Fire from './Fire';

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('pointerdown', onMouseDown, false);
window.addEventListener('pointerup', onMouseUp, false);
window.addEventListener('keydown', onKeyDown, false);
window.addEventListener('keyup', onKeyUp, false);
window.addEventListener('mousemove', onMouseMove, false);

let renderer, scene, camera;
let controller;
let gui;

let floor;
let ambientLight;

let fire = null;

let objects = {
    elements: [],
};
let selected;

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

function initScene(){
    //creating and setting up camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
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
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    //set tonemapping
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    //appending renderer to dom
    document.body.appendChild(renderer.domElement);
}

function switchToFPControls(){
    if(controller instanceof OrbitController){
        controller.destroy();
        gui.hide();
        controller = new FirstPersonController(camera, document);
        fire = new Fire(gui.getJSONController(), null, camera, scene);
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

init();

