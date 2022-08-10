import * as THREE from 'three';
import * as Loader from './Loader.js';

export default class Fire{
    constructor(JSONController, parent, camera, scene, modelViewMats, projectionMats){
        this.parent = parent;
        this.camera = camera;
        //create fire mesh
        this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(10.55,10.55));
        this.mesh.position.set(0, 4.65, 0.75);
        this.scene = scene;

        this.light = new THREE.PointLight(0xccac77, 0.2, 100);
        this.light.position.set(0, 4.54, 0);
        this.scene.add(this.light);

        //only used when the fire is loaded as individual frames
        this.material = Loader.loadFireFromFrames(JSONController);
 
        //adding fire meseh to the scene
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
        this.boundingBox.center(this.mesh.position);
        //this.mesh.position.multipyScalar(-1);
        this.pivot = new THREE.Group();
        this.scene.add(this.pivot);
        this.pivot.add(this.mesh)
        this.counter = 0;
        this.clock = new THREE.Clock();
        this.deltaTime = 0;
        this.frameRate = JSONController.frameRate;
        this.numberOfFrames = JSONController.endFrame - JSONController.startFrame;

        // matrix4 arrays with size 4 for each perspective: F = 0, R = 1, B = 2, L = 3
        this.modelViewMats = modelViewMats;
        this.projectionMats = projectionMats;
    }

    destroy(){
        this.scene.remove(this.pivot);
        this.scene.remove(this.mesh);
    }

    getMesh(){
        return this.mesh;
    }

    addToScene(scene){
        scene.add(this.mesh);
    }

    // returns index of the perspective that needs to be loaded into the shader
    getPerspective(){
        //calculate angle of fire from camera position with pythagoras theorem
        let angle = Math.atan2(this.camera.position.z - this.mesh.position.z, this.camera.position.x - this.mesh.position.x) + Math.PI;
        let perspective = -1;
        if(angle <= Math.PI/4 * 1 | angle >= Math.PI/4 * 7){
            perspective = 0;
        }
        if(angle <= Math.PI/4 * 3 && angle >= Math.PI/4 * 1){
            perspective = 1;
        }
        if(angle <= Math.PI/4 * 5 && angle >= Math.PI/4 * 3){
            perspective = 2;
        }
        if(angle <= Math.PI/4 * 7 && angle >= Math.PI/4 * 5){
            perspective = 3;
        }
        return perspective;
    }

    update(){
        //calculate angle of fire from camera position with pythagoras theorem
        var angle = Math.atan(1/(Math.abs(this.camera.position.z) / Math.abs(this.camera.position.x)));
        if(this.camera.position.x > 0  && this.camera.position.z < 0){
            angle = Math.PI / 2 + (Math.PI / 2 - angle);
        }
        if(this.camera.position.x < 0  && this.camera.position.z < 0){
            angle += Math.PI;
        }
        if(this.camera.position.x < 0  && this.camera.position.z > 0){
            angle = 3 * Math.PI / 2 + (Math.PI / 2 - angle);
        }
        //rotating fire around pivot point/parent object
        this.pivot.rotation.y = angle;
        //updating fire texture (only used when the fire is loaded as individual frames)

        console.log("Active perspective: " + this.getPerspective())
        
        this.deltaTime += this.clock.getDelta();
        if(this.deltaTime > (1 / this.frameRate)){
            this.mesh.material = this.material[this.counter % this.numberOfFrames];
            this.counter++;
            this.deltaTime = this.deltaTime % (1/this.frameRate);
        }
        
        
    }

}