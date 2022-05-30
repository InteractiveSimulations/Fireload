import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export default class OrbitController{
    constructor(camera, domElement, scene, objects, selected){
        //setting up orbit controls
        let orbitControls = new OrbitControls(camera, domElement);
        //setting up transform controls
        
        this.transformControls = new TransformControls(camera, domElement);
        //orbit controls are disabled when mouse is pressed
        
        this.transformControls.addEventListener('mouseDown', function() {
            orbitControls.enabled = false;
        })
        this.transformControls.addEventListener('mouseUp', function() {
            orbitControls.enabled = true;
        })
        scene.add(this.transformControls);
        
        //create raycaster
        this.raycaster = new THREE.Raycaster(); 
        //scene data
        this.camera = camera;
        this.camera.position.set(10, 10, 10);
        this.scene = scene;
        this.objects = objects;
        this.selected = selected;
    }

    destroy(){
        this.scene.remove(this.transformControls);
    }

    move(){

    }

    onMouseDown(event) {  
        const pointer = new THREE.Vector2();
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(pointer, this.camera);
        const intersects = this.raycaster.intersectObjects(this.objects, true);
        if (intersects.length > 0) {
            this.transformControls.attach(intersects[0].object);
            this.selected = intersects[0].object;
        }
        else {
            this.transformControls.detach();
            this.selected = null;
        }
        
        
    }

    onMouseMove(event){

    }

    onMouseUp(event){

    }

    removeObject(){
        if(this.selected != null | this.selected != 'undefinded'){
            const index = this.objects.indexOf(this.selected);
            if(index > -1){
                this.objects.splice(index, 1);
                this.scene.remove(this.selected);
            };
            this.selected = null;
        }
    }

    onKeyDown(event){
        switch(event.code){
            //change transform controls to translate
            case 'KeyT':
                this.transformControls.setMode('translate');
                break;
            //change transform controls to rotate
            case 'KeyR':
                this.transformControls.setMode('rotate');
                break;
            //change transform controls to scale
            case 'KeyS':
                this.transformControls.setMode('scale');
                break;
            case 'KeyX':
                this.removeObject();
                break;           
        }
    }

    onKeyUp(event){}
}