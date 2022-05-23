import './style.css'
import * as THREE from 'three'
import { GUI } from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('pointerdown', onMouseDown, false);
window.addEventListener('keydown', onKeyDown, false);

let renderer, scene, camera, orbitControls, fpControls, gui, transformControls, raycaster, loader, hdriLoader;

const stats = Stats();
document.body.appendChild(stats.dom);

let objects = [];

const fShader = require('./glsl/fragment.glsl');
const vShader = require('./glsl/vertex.glsl');

var pointLightProperties;


function init() {
    //creating and setting up the renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    //light settings
    renderer.physicallyCorrectLights = true;
    //shadow settings
    //renderer.shadowMap.enabled = true;
    //renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    //activate rgbe encoding for hdri
    renderer.outputEncoding = THREE.sRGBEncoding;
    //tonemap settings
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8;
    //appending renderer to dom
    document.body.appendChild(renderer.domElement);

    //creating and setting up camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.set(0, 10, 0);
    camera.lookAt(0,0,0);


    scene = new THREE.Scene();

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
    
    raycaster = new THREE.Raycaster();

    initBasicObj();
    //loadObject(1);
    //initLights();
    initGui();

    hdriLoader = new RGBELoader();
    hdriLoader.load('MR_INT-001_NaturalStudio_NAD.hdr', function(texture){
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;
        render();
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

    update();
}

function initBasicObj() {
    const plane = new THREE.Mesh(
        new THREE.BoxGeometry(10, 10, 0.3),
        new THREE.MeshStandardMaterial());
    //rotate
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(0, 0, -0.7);
    plane.receiveShadow = true;
    const geometry = new THREE.SphereGeometry();
    const customShaderMaterial = new THREE.ShaderMaterial({
        vertexShader: vShader,
        fragmentShader: fShader,
    });
    const phongMat = new THREE.MeshPhongMaterial({
        color: 0x333333,
        shininess: 10,
        specular: 0xffffff,
    });
    const cube = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 100
    }));
    cube.castShadow = true;
    let cube2 = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial());
    cube2.castShadow = true;
    cube2.position.set(2, 2, 1);
    objects.push(cube);
    objects.push(cube2);
    
    scene.add(cube);
    scene.add(cube2);
    scene.add(plane);
    scene.add(transformControls);
}

function initGui() {
    gui = new GUI();

    var floorsFolder = gui.addFolder('Floors');


    //settings
    var settingsFolder = gui.addFolder('Settings');
    //camera settings
    var cameraFolder = settingsFolder.addFolder('Camera');  
    cameraFolder.add(camera, 'fov', 30, 90, 0.1).onChange(function(){ camera.updateProjectionMatrix()}).name('Fiel of view');
    //graphics settings
    var graphicsFolder = settingsFolder.addFolder('Graphics');
    //TODO: antialias
    //TODO: HDRIResolution
    var sphereFolder = settingsFolder.addFolder('Sphere');
    //sphereFolder.add()
    
    const lightFolder = gui.addFolder('Light');
    /*
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
    */
    /* TODO: fix Performance visuals*/ 
    /*
    const perfFolder = gui.addFolder('Performance');
    var stats = new Stats();
    stats.domElement.height = '48px';
    [].forEach.call(stats.domElement.children, (child) => (child.style.display = ''));
    var perfLi = document.createElement("li");
    stats.domElement.style.position = "static";
    perfLi.appendChild(stats.domElement);
    perfLi.classList.add("gui-stats");
    perfFolder.__ul.appendChild(perfLi);
    */
}
let pointLight;
let pointLightHelper;
function initLights() {
    const ambientLight = new THREE.HemisphereLight(0xb1e1ff, 0xb97a20, 0.1);
    scene.add(ambientLight);
}

function changeToFPControls(){
    //fp = true;
    //disposing orbit controls so that they dont interfere
    orbitControls.dispose();
    //creating fp controller with pointer lock controls
    fpControls = new FirstPersonControls(camera, renderer.domElement);
    /*
    fpControls.addEventListener('change', render);
    fpControls.addEventListener( 'lock', function () {
        menu.style.display = 'none';   
    } );
    fpControls.addEventListener( 'unlock', function () {
        menu.style.display = 'block';
    } );
    */
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
    }
    else {
        transformControls.detach();
    }
}

function loadObject(objectId){
    loader = new GLTFLoader();
    loader.load(objectId + '.gltf', 
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

function onKeyDown(event){
    if(fp){    
        switch(event.code){
            //first person controls
            case 'KeyW':
                fpControls.moveForward(0.25);
                break;
            case 'KeyA':
                fpControls.moveRight(-0.25);
                break;
            case 'KeyS':
                fpControls.moveForward(-0.25);
                break;
            case 'KeyD':
                fpControls.moveRight(0.25);
                break;
        }
    }
    switch(event.code){
        //change controls
        case 'KeyF':
            changeToFPControls();
            break;
    }

}

init();
