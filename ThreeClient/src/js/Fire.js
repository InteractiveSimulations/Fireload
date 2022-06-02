import * as THREE from 'three'

export default class Fire{
    constructor(fireController, parent, camera){
        this.parent = parent;
        this.camera = camera;
        this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1));
        this.mesh.position.set(1.0, 1.0, 1.0);
        this.mesh.rotateY(this.camera.rotation.y);
    }

    getMesh(){
        return this.mesh;
    }

    addToScene(scene){
        scene.add(this.mesh);
    }

    update(){
        this.mesh.position.set(1.0, 1.0, 1.0);
        this.mesh.rotateY(this.camera.rotation.y);
    }

}