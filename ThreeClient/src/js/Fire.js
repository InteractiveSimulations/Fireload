import * as THREE from 'three'
import * as Loader from './Loader.js'

export default class Fire{
    constructor(video, parent, camera, scene){
        this.parent = parent;
        this.camera = camera;
        //create fire mesh
        this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(4, 4));
        this.mesh.position.set(0, 1.8, 0.75);
        this.scene = scene;

        //only used when the fire is loaded as individual frames
        //this.material = Loader.loadFire(null, this.mesh);

        //creating material (only used when the fire is loaded as a video)
        video.play();
        let videoTexture = new THREE.VideoTexture(video);
        this.material = new THREE.MeshBasicMaterial( {map: videoTexture } );
        this.material.needsUpdate = true;
        this.mesh.material = this.material;

 
        //adding fire meseh to the scene
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
        this.boundingBox.center(this.mesh.position);
        //this.mesh.position.multipyScalar(-1);
        this.pivot = new THREE.Group();
        this.scene.add(this.pivot);
        this.pivot.add(this.mesh);
        this.counter = 0;
        this.clock = new THREE.Clock();
        this.deltaTime = 0;
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
        /*
        this.deltaTime += this.clock.getDelta();
        if(this.deltaTime > (1/30)){
            this.mesh.material = this.material[this.counter % 179];
            this.counter++;
            this.deltaTime = this.deltaTime % (1/30);
        }
        */
        
    }

}