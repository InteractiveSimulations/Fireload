import * as THREE from 'three'
import { Material, MeshStandardMaterial } from 'three';

export default class Fire{
    constructor(fireController, parent, camera, scene){
        this.parent = parent;
        this.camera = camera;
        //create fire mesh
        this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
        this.mesh.position.set(0, 1, 0.75);
        this.scene = scene;
        this.material = new MeshStandardMaterial({color: 0xFF5900});
        this.mesh.material = this.material;  
        //adding fire meseh to the scene
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
        this.boundingBox.center(this.mesh.position);
        //this.mesh.position.multipyScalar(-1);
        this.pivot = new THREE.Group();
        this.scene.add(this.pivot);
        this.pivot.add(this.mesh);
    }

    destroy(){
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
            console.log('between 90-180 degrees');
            angle = Math.PI / 2 + (Math.PI/2 - angle);
        }
        if(this.camera.position.x < 0  && this.camera.position.z < 0){
            console.log('between 180-270 degrees');
            angle += Math.PI;
        }
        if(this.camera.position.x < 0  && this.camera.position.z > 0){
            console.log('between 270-0 degrees');
            angle = 3 * Math.PI / 2 + (Math.PI/2 - angle);
        }
        //rotating fire around pivot point/parent object
        this.pivot.rotation.y = angle;
    }

}