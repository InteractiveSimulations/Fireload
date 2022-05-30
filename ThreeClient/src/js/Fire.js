import * as THREE from 'three'
import { Material, MeshStandardMaterial } from 'three';

export default class Fire{
    constructor(fireController, parent, camera, scene){
        this.parent = parent;
        this.camera = camera;
        this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
        this.mesh.position.set(0, 1, 0);
        this.mesh.rotateY(this.camera.rotation.y);
        this.scene = scene;
        this.material = new MeshStandardMaterial({color: 0xFF5900});
        this.mesh.material = this.material;
        scene.add(this.mesh);
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
        //calculate angle (only works when object is at the center)
        this.mesh.setRotationFromAxisAngle( new THREE.Vector3(0, 1, 0 ), this.camera.rotation.y);
    }

}