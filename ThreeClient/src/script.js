import './style.css'
import * as THREE from 'three'
import UI  from './GUI.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import * as Loader from './Loader.js'
import FirstPersonController from './FirstPersonController.js'

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('pointerdown', onMouseDown, false);
window.addEventListener('keydown', onKeyDown, false);

let renderer, scene, camera;
let orbitControls, fpControls, transformControls;
let raycaster;
let gui;

let floor;
let ambientLight;

let objects = [];
let selected;

//create performance stats
const stats = Stats();
document.body.appendChild(stats.dom);


function init() {
    initScene();
    initRendering();
    initControls();
    //create gui
    gui = new UI(scene, objects, floor, camera, ambientLight);
    update();
}

function initScene(){
     //creating and setting up camera
     camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
     camera.position.set(10, 5, 10);
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
    let cube = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
    cube.position.set(0, 0.5, 0);
    scene.add(cube);
    objects.push(cube);
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
    renderer.outputEncoding = THREE.sRGBEncoding;  
    //appending renderer to dom
    document.body.appendChild(renderer.domElement);
}

function initControls(){
    //setting up orbit controls
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.addEventListener('change', render);
    //setting up transform controls
    transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.addEventListener('change', render);
    transformControls.addEventListener('mouseDown', function() {
        orbitControls.enabled = false;
    })
    transformControls.addEventListener('mouseUp', function() {
        orbitControls.enabled = true;
    })
    scene.add(transformControls);  
    //create raycaster
    raycaster = new THREE.Raycaster();
}

function changeToFPControls(){
    //reset camera
    camera.position.set(-5, 1.7, -5);
    camera.lookAt(5,1.7,0);
}

function render() {
    renderer.render(scene, camera);
}

function update() {
    stats.update();
    render();
    requestAnimationFrame(update);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function onMouseDown(event) {
    const pointer = new THREE.Vector2();
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(objects, true);
    if (intersects.length > 0) {
        transformControls.attach(intersects[0].object);
        selected = intersects[0].object;
    }
    else {
        transformControls.detach();
        selected = null;
    }
}

function removeObject(){
    if(selected != null | selected != 'undefinded'){
        const index = objects.indexOf(selected);
        if(index > -1){
            objects.splice(index, 1);
            scene.remove(selected);
        };
        selected = null;
    }
}

function onKeyDown(event){
    switch(event.code){
        //change transform controls to translate
        case 'KeyT':
            transformControls.setMode('translate');
            break;
        //change transform controls to rotate
        case 'KeyR':
            transformControls.setMode('rotate');
            break;
        //change transform controls to scale
        case 'KeyS':
            transformControls.setMode('scale');
            break;
        //change to fp controls
        case 'KeyF':
            changeToFPControls();
            break;
        case 'KeyX':
            removeObject();
            break;           
    }
}

init();

