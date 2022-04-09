import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui'

window.addEventListener('resize', onWindowResize, false);

let renderer, scene, camera, control, clock, gui;

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
    camera.position.set(0, 7, 10);
    camera.lookAt(0,0,0);

    scene = new THREE.Scene();
    clock = new THREE.Clock();
    control = new OrbitControls(camera, renderer.domElement);

    const gridHelper = new THREE.GridHelper(10, 20);
    scene.add(gridHelper);

    initObjects();
    initGui();
}

function initObjects() {
    //var shader = require('./glsl/fragment.glsl');
    const geometry = new THREE.BoxGeometry();
    const customShaderMaterial = new THREE.ShaderMaterial({
    });
    const cube = new THREE.Mesh(geometry, customShaderMaterial);

    scene.add(cube);
}

function initGui() {
    gui = new GUI();
    const cubeFolder = gui.addFolder('Cube');
    const cameraFolder = gui.addFolder('Camera')
}

function initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(light);
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(1, 0, 1);
    scene.add(pointLight);
}

function render() {
    renderer.render(scene, camera);
}

function update() {
    requestAnimationFrame(update);
    control.update();
    render();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

init();
update();
