import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'

export default class FirstPersonController{
    constructor(camera, document){
        this.camera = camera;
        camera.position.set(-5, 1.7, -5);
        camera.lookAt(0,0,0);
        this.camera.rotation.order = 'YXZ';
        document.body.requestPointerLock();
        this.controls = new PointerLockControls(camera, document.body); //can only be called after pointerlock call request
        
        this.moveForward = false;
        this.moveBackward = false;
        this.moveRight = false;
        this.moveLeft = false;

        this.crouched = false;

        this.speed = 55.0;

        this.prevTime = performance.now();
        this.velocity = new THREE.Vector3();
		this.direction = new THREE.Vector3();
    }
    destroy(){
        
    }
    onMouseDown(event){

    }
    onMouseMove(event){
        this.camera.rotation.x -= event.movementY / 500;
        this.camera.rotation.y -= event.movementX / 500;
    }
    
    onMouseUp(event){

    }
    onKeyDown(event){
        switch ( event.code ) {
            case 'ArrowUp':
            case 'KeyW':
                this.moveForward = true;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                this.moveLeft = true;
                break;

            case 'ArrowDown':
            case 'KeyS':
                this.moveBackward = true;
                break;

            case 'ArrowRight':
            case 'KeyD':
                this.moveRight = true;
                break;
            
            case 'KeyC':
                this.crouch();
        }

    }

    onKeyUp(event){
        console.log('on key up');
        switch ( event.code ) {

            case 'ArrowUp':
            case 'KeyW':
                this.moveForward = false;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                this.moveLeft = false;
                break;

            case 'ArrowDown':
            case 'KeyS':
                this.moveBackward = false;
                break;

            case 'ArrowRight':
            case 'KeyD':
                this.moveRight = false;
                break;
            

        }
    }

    move(){
        //calculat delta time
        const deltaTime = (performance.now() - this.prevTime) / 1000;
        //calculate velocity according elapsed to time     
        this.velocity.x -= this.velocity.x * 10.0 * deltaTime;
		this.velocity.z -= this.velocity.z * 10.0 * deltaTime;

        //calculate direction according to pressed keys
        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
		this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
		this.direction.normalize(); //ensures consistent movements in all directions

        if( this.moveForward || this.moveBackward){
            this.velocity.z -= this.direction.z * this.speed * deltaTime;
        }
		if( this.moveLeft || this.moveRight ){
            this.velocity.x -= this.direction.x * this.speed * deltaTime;
        }
        
        //moving player
        this.controls.moveRight( - this.velocity.x * deltaTime);
		this.controls.moveForward( - this.velocity.z * deltaTime);
        
        this.prevTime = performance.now();
    }

    crouch(){
        this.crouched = !this.crouched;
        //changing height of camera
        this.camera.position.y -= (Number(this.crouched) * 2 - 1) * 0.7;
        this.speed -= (Number(this.crouched) * 2 - 1) * 35;
    }

    addEventListener(){
        this.controls.addEventListener(type, listener);
    }
}