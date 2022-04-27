import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'

export default class FirstPersonController{
    constructor(camera, document){

        this.controls = new PointerLockControls(camera, document.body);
        
        this.moveForward = false;
        this.moveBackward = false;
        this.moveRight = false;
        this.moveLeft = false;

        this.prevTime = performance.now();
        this.velocity = new THREE.Vector3();
		this.direction = new THREE.Vector3();
    }

    //
    onKeyDown(event){
        switch ( event.code ) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;

        }
    }

    onKeyUp(event){
        switch ( event.code ) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;

        }
    }

    move(time){
        //calculat delta time
        const deltaTime = time - this.prevTime;
        //calculate velocity according to time
        this.velocity.x -= this.velocity.x * 10.0 * deltaTime;
		this.velocity.z -= this.velocity.z * 10.0 * deltaTime;

        //calculate direction according to pressed keys
        direction.z = Number(moveForward) - Number(moveBackward);
		direction.x = Number(moveRight) - Number(moveLeft);
		direction.normalize(); //ensures consistent movements in all directions

        if( moveForward || moveBackward){
            velocity.z -= direction.z * 400.0 * delta;
        }
		if( moveLeft || moveRight ){
            velocity.x -= direction.x * 400.0 * delta;
        }

        controls.moveRight( - velocity.x * delta );
		controls.moveForward( - velocity.z * delta );
    }
}