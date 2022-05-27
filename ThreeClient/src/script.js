import './style.css'
import * as THREE from 'three'
import { GUI } from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import FirstPersonController from './FirstPersonController.js'

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('pointerdown', onMouseDown, false);
window.addEventListener('keydown', onKeyDown, false);

let renderer, scene, camera;
let orbitControls, fpControls, transformControls;
let raycaster;
let loader, hdriLoader;
let gui;

let floorController, objectController, hdriController;

let floor;
let ambientLight;

let objects = [];
let selected;
let lights = [];

let material = new THREE.MeshStandardMaterial();

//create performance stats
const stats = Stats();
document.body.appendChild(stats.dom);

var pointLightProperties;

function init() {
    //creating and setting up camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.set(10, 5, 10);

    //create scene
    scene = new THREE.Scene();

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

    var test = new FirstPersonController(camera, renderer.domElement);
    
    //create raycaster
    raycaster = new THREE.Raycaster();

    //init
    initObjects();
    initLights();
    initGui();
    update();
}

function initObjects() {
    //create floor
    floor = new THREE.Mesh(new THREE.BoxGeometry(10, 0.1, 10), new THREE.MeshStandardMaterial());
    scene.add(floor);

    //adding cube
    let cube = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
    cube.position.set(0, 0.5, 0);
    scene.add(cube);
    objects.push(cube);
}

function initGui() {
    gui = new GUI();

    //Floors
    //changes the floor material
    floorController = {
        texture: 'none',
        resolution: '1k',
        repeat: 1,
    }
    const floorFolder = gui.addFolder('Floor');
    floorFolder.add(floorController, 'texture', ['none', 'wood', 'small tiles']).name('Texture').onChange(loadFloorMaterial);
    floorFolder.add(floorController, 'repeat', 0.2, 50).name('Repeat').onChange(loadFloorMaterial);

    //HDRI
    //changes the hdri
    hdriController = {
        texture: 'none',
        resolution: '1k'
    }
    const hdriFolder = gui.addFolder('HDRI');
    hdriFolder.add(hdriController, 'texture', ['none', 'apartment 1 [day][sunny]', 'apartment 2 [day][sunny]', 'apartment 3 [day][sunny]',
        'forrest 1 [day][overcast]', 'forrest 2 [day][sunny]', 'forrest 3 [day][sunny]', 'field 1 [sunrise][sunny]', 'field 2 [day][sunny]', 'field 3 [sunset][sunny]',
        'city 1 [day][sunny]', 'city 2 [day][overcast]', 'city 3 [night]']).name('Texture').onChange(loadHDRI);

    //Objects
    //adds an object to the scene
    objectController = {
        object: 'table',
        load: loadObject
    }
    const objectFolder = gui.addFolder('Objects');
    //Furniture
    const furnitureFolder = objectFolder.addFolder('Furniture');
    furnitureFolder.add(objectController, 'object', ['table', 'tv']).name('Object');
    furnitureFolder.add(objectController, 'load').name('Add object');

    //Settings
    const settingsFolder = gui.addFolder('Settings');
    //camera settings
    const cameraFolder = settingsFolder.addFolder('Camera');  
    cameraFolder.add(camera, 'fov', 30, 90, 0.1).onChange(function(){ camera.updateProjectionMatrix()}).name('Fiel of view');
    //graphics settings
    const graphicsFolder = settingsFolder.addFolder('Graphics');
    graphicsFolder.add(hdriController, 'resolution', ['1k', '2k', '4k']).name('HDRI texture resolution').onChange(loadHDRI);
    graphicsFolder.add(floorController, 'resolution', ['1k', '2k']).name('Floor texture resolution').onChange(loadFloorMaterial);
    
    //Light
    const lightFolder = gui.addFolder('Light');
    const ambientLightController = {
        skyColor: 0xe0f3ff,
        groundColor: 0xffc26e,
        intensity: 0.2
    }
    const ambientLightFolder = lightFolder.addFolder('Ambient light');
    ambientLightFolder.addColor(ambientLightController, 'skyColor').onChange(function(color) {
        ambientLight.skyColor = new THREE.Color(color);
        render();
    })
    ambientLightFolder.addColor(ambientLightController, 'groundColor').onChange(function(color) {
        ambientLight.groundColor = new THREE.Color(color);
        render();
    })
    ambientLightFolder.add(ambientLightController, 'intensity').onChange(function(value) {
        ambientLight.intensity = value;
        render();
    })
}
let pointLight;
let pointLightHelper;
function initLights() {
    //adding floor to the scene
    ambientLight = new THREE.HemisphereLight(0xe0f3ff, 0xffc26e, 0.2);
    scene.add(ambientLight);
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

//
//loading functions
//
//takes in object name and adds objects the scene
function loadObject(objectId){
    var objectLoader = new GLTFLoader();
    objectLoader.setPath('/assets/models/')
    objectLoader.load(objectController.object + '.glb', 
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

//takes in the hdri name and the resolution and adds hdri to scene
function loadHDRI(hdriName, resolution){
    if(hdriController.texture == 'none'){
        scene.background = null;
        scene.environment = null;
    }
    else{
        hdriLoader = new RGBELoader();
        hdriLoader.setPath('/assets/textures/hdri/');
        hdriLoader.load(hdriController.texture + '_' + hdriController.resolution + '.hdr', function(texture){
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = texture;
            scene.environment = texture;
        },
        //called when loading is in progresses
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        //called when loading has errors
        function ( error ) {
            console.log( 'An error happened while loading the HDRI texture!' );
        }
        );
    }
    render();
}

//takes in texture name and resolution and sets texture as floor texture
function loadFloorMaterial(materialName, resolution){
    //standard material is applied when none is chosen
    if(floorController.texture == 'none'){
        floor.material = new THREE.MeshStandardMaterial();
    }
    else{
        
        const textureLoader = new THREE.TextureLoader();
        textureLoader.setPath('assets/textures/floor/');

        //loading albedo/diffuse map
        var diffuse = textureLoader.load(floorController.texture + '-diffuse_' + floorController.resolution + '.png',
        //called when loading is in progresses
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        //called when loading has errors
        function ( error ) {
            console.log( 'An error happened while loading the floor diffuse texture!' );
        }
        );

        diffuse.wrapS = THREE.RepeatWrapping;
        diffuse.wrapT = THREE.RepeatWrapping;
        diffuse.repeat.set(floorController.repeat, floorController.repeat);

        //loading normal map
        var normal = textureLoader.load(floorController.texture + '-normal_' + floorController.resolution + '.png',
        //called when loading is in progresses
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        //called when loading has errors
        function ( error ) {
            console.log( 'An error happened while loading the floor normaltexture!' );
        }
        );

        normal.wrapS = THREE.RepeatWrapping;
        normal.wrapT = THREE.RepeatWrapping;
        normal.repeat.set(floorController.repeat, floorController.repeat);  

        //loading roughness map
        var roughness = textureLoader.load(floorController.texture + '-roughness_' + floorController.resolution + '.png',
        //called when loading is in progresses
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        //called when loading has errors
        function ( error ) {
            console.log( 'An error happened while loading the floor rougness texture!' );
        }
        );

        roughness.wrapS = THREE.RepeatWrapping;
        roughness.wrapT = THREE.RepeatWrapping;
        roughness.repeat.set(floorController.repeat, floorController.repeat);

        // immediately use the texture for material creation
        floor.material =  new THREE.MeshStandardMaterial( { map: diffuse, normalMap: normal, roughnessMap: roughness} );
    }
    render();
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

