import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {TransformControls} from 'three/examples/jsm/controls/TransformControls.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui'
import { Vector3 } from 'three';

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('pointerdown', onMouseDown, false);

let renderer, scene, camera, control, clock, gui, transformControl, raycaster;
let objects = [];
let pointLightProperties;
const fShader = require('./glsl/fragment.glsl');
const vShader = require('./glsl/vertex.glsl');



function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(0, -15, 10);
    camera.lookAt(0,0,0);

    scene = new THREE.Scene();
    clock = new THREE.Clock();

    control = new OrbitControls(camera, renderer.domElement);
    control.addEventListener('change', render);
    transformControl = new TransformControls(camera, renderer.domElement);
    transformControl.addEventListener('change', render);
    transformControl.addEventListener('mouseDown', function() {
        control.enabled = false;
    })
    transformControl.addEventListener('mouseUp', function() {
        control.enabled = true;
    })
    raycaster = new THREE.Raycaster();

    //const gridHelper = new THREE.GridHelper(10, 20);
    //scene.add(gridHelper);

    initObjects();
    initLights();
    initGui();
}

function initObjects() {
    const plane = new THREE.Mesh(
        new THREE.BoxGeometry(10, 10, 0.3),
        new THREE.MeshPhongMaterial({
            color: 0xffffff,
            specular: 0xffffff,
            shininess: 10,
            side: THREE.DoubleSide
        }));
    plane.position.set(0, 0, -0.7);
    plane.receiveShadow = true;
    const geometry = new THREE.BoxGeometry();
    const customShaderMaterial = new THREE.ShaderMaterial({
        vertexShader: vShader,
        fragmentShader: fShader,
    });
    const phongMat = new THREE.MeshPhongMaterial({
        color: 0x333333,
        shininess: 10,
        specular: 0xffffff,
    });
    const cube = new THREE.Mesh(geometry, customShaderMaterial);
    cube.castShadow = true;
    let cube2 = new THREE.Mesh( geometry, phongMat);
    cube2.castShadow = true;
    cube2.position.set(2, 2, 1);
    objects.push(cube);
    objects.push(cube2);
    
    scene.add(cube);
    scene.add(cube2);
    scene.add(plane);
    scene.add(transformControl);
}

function initGui() {
    gui = new GUI();
    const cubeFolder = gui.addFolder('Cube');
    const cameraFolder = gui.addFolder('Camera')
    const lightFolder = gui.addFolder('Light')

    lightFolder.add(pointLightProperties, 'intensity', 0, 1).onChange(function(newVal) {
        pointLight.intensity = newVal;
        render();
    })
    lightFolder.addColor(pointLightProperties, 'color').onChange(function(newVal) {
        pointLight.color = new THREE.Color(newVal);
        render();
    })
    lightFolder.add(pointLightProperties.position, 'x', -10, 10).onChange(function(newVal) {
        pointLight.position.x = newVal;
        render();
    })
    lightFolder.add(pointLightProperties.position, 'y', -10, 10).onChange(function(newVal) {
        pointLight.position.y = newVal;
        render();
    })
    lightFolder.add(pointLightProperties.position, 'z', -10, 10).onChange(function(newVal) {
        pointLight.position.z = newVal;
        render();
    })
    lightFolder.add(pointLightProperties, 'showHelper').onChange(function(newVal) {
        if(newVal) {
            scene.add(pointLightHelper);
        } else {
            scene.remove(pointLightHelper);
        }
        render();
    })

    const perfFolder = gui.addFolder('Performance');
    var stats = new Stats();
    stats.domElement.height = '48px';
    [].forEach.call(stats.domElement.children, (child) => (child.style.display = ''));
    var perfLi = document.createElement("li");
    stats.domElement.style.position = "static";
    perfLi.appendChild(stats.domElement);
    perfLi.classList.add("gui-stats");
    perfFolder.__ul.appendChild(perfLi);
}
let pointLight;
let pointLightHelper;
function initLights() {

    const ambientLight = new THREE.HemisphereLight(0xb1e1ff, 0xb97a20, 0.6);
    scene.add(ambientLight);

    pointLightProperties = {
        intensity: 0.3,
        showHelper: false,
        position: new Vector3(4,4,4),
        color: 0xffffff,
    };
    pointLight = new THREE.PointLight(pointLightProperties.color, pointLightProperties.intensity);
    pointLight.castShadow = true;
    //pointLight.shadow.mapSize.width = 1024;
    //pointLight.shadow.mapSize.height = 1024;
    //pointLight.shadow.camera.near = 0.5;
    //pointLight.shadow.camera.far = 500;
    pointLight.position.set(pointLightProperties.position.x, pointLightProperties.position.y, pointLightProperties.position.z);
    pointLightHelper = new THREE.PointLightHelper(pointLight);

    scene.add(pointLight);
}

function render() {
    renderer.render(scene, camera);
}

function update() {
    render();
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
    const intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
        transformControl.attach(intersects[0].object);
    }
    else {
        transformControl.detach();
    }
}

init();
window.requestAnimationFrame(update);
