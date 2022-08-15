const fragment = require('../glsl/fragment.glsl');
const vertex = require('../glsl/vertex.glsl');

import * as THREE from 'three';
import * as Loader from './Loader.js';

export default class Fire{
    constructor(JSONController, captureView, captureProjection, camera, scene){
        //
        this.camera = camera;
        // creating fire material shader
        this.textures = Loader.loadParallaxFireTextures();
        this.view = new THREE.Matrix4();
        this.view.set(1, 0, 0, -10,
                      0, 1, 0, 0,
                      0, 0, 1, 0,
                      0, 0, 0, 1);
        this.projection = new THREE.Matrix4(); 
        this.projection.set(6.9395, 0, 0, 0,
                            0, 6.9395, 0, 0,
                            0, 0, -1.001, -1,
                            0, 0, -0.1001, 0);
        this.material = new THREE.ShaderMaterial( {
            uniforms: { 
                //resolution of three.js
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                uViewMatrix: { value: camera.matrixWorldInverse },
                uProjMatrix: { value: camera.projectionMatrix },
                uViewInverse: { value: camera.matrixWorldInverse.clone().invert() },
                uProjInverse: { value: camera.projectionMatrix.clone().invert() },
                uHeightfieldTex: { value: this.textures[1] },
                uRadianceTex: { value: this.textures[0] },
                uCaptureViewMatrix: { value: this.view },
                uCaptureProjMatrix: { value: this.projection }
            },
            
            vertexShader: vertex,
            fragmentShader: fragment
        })

        console.log("uResolution: [" + window.innerWidth + ", " + window.innerHeight + "]")
        console.log("uViewMatrix:");
        console.log("[" + camera.matrixWorldInverse.elements[0] + ", " + camera.matrixWorldInverse.elements[4] + ", " + camera.matrixWorldInverse.elements[8] + ", " + camera.matrixWorldInverse.elements[12] + "]")
        console.log("[" + camera.matrixWorldInverse.elements[1] + ", " + camera.matrixWorldInverse.elements[5] + ", " + camera.matrixWorldInverse.elements[9] + ", " + camera.matrixWorldInverse.elements[13] + "]")
        console.log("[" + camera.matrixWorldInverse.elements[2] + ", " + camera.matrixWorldInverse.elements[6] + ", " + camera.matrixWorldInverse.elements[10] + ", " + camera.matrixWorldInverse.elements[14] + "]")
        console.log("[" + camera.matrixWorldInverse.elements[3] + ", " + camera.matrixWorldInverse.elements[7] + ", " + camera.matrixWorldInverse.elements[11] + ", " + camera.matrixWorldInverse.elements[15] + "]")
        console.log();
        console.log("uViewInverse:")
        console.log("[" + camera.matrixWorldInverse.clone().invert().elements[0] + ", " + camera.matrixWorldInverse.clone().invert().elements[4] + ", " + camera.matrixWorldInverse.clone().invert().elements[8] + ", " + camera.matrixWorldInverse.clone().invert().elements[12] + "]")
        console.log("[" + camera.matrixWorldInverse.clone().invert().elements[1] + ", " + camera.matrixWorldInverse.clone().invert().elements[5] + ", " + camera.matrixWorldInverse.clone().invert().elements[9] + ", " + camera.matrixWorldInverse.clone().invert().elements[13] + "]")
        console.log("[" + camera.matrixWorldInverse.clone().invert().elements[2] + ", " + camera.matrixWorldInverse.clone().invert().elements[6] + ", " + camera.matrixWorldInverse.clone().invert().elements[10] + ", " + camera.matrixWorldInverse.clone().invert().elements[14] + "]")
        console.log("[" + camera.matrixWorldInverse.clone().invert().elements[3] + ", " + camera.matrixWorldInverse.clone().invert().elements[7] + ", " + camera.matrixWorldInverse.clone().invert().elements[11] + ", " + camera.matrixWorldInverse.clone().invert().elements[15] + "]")
        console.log();
        console.log("uProjMatrix:")
        console.log("[" + camera.projectionMatrix.elements[0] + ", " + camera.projectionMatrix.elements[4] + ", " + camera.projectionMatrix.elements[8] + ", " + camera.projectionMatrix.elements[12] + "]")
        console.log("[" + camera.projectionMatrix.elements[1] + ", " + camera.projectionMatrix.elements[5] + ", " + camera.projectionMatrix.elements[9] + ", " + camera.projectionMatrix.elements[13] + "]")
        console.log("[" + camera.projectionMatrix.elements[2] + ", " + camera.projectionMatrix.elements[6] + ", " + camera.projectionMatrix.elements[10] + ", " + camera.projectionMatrix.elements[14] + "]")
        console.log("[" + camera.projectionMatrix.elements[3] + ", " + camera.projectionMatrix.elements[7] + ", " + camera.projectionMatrix.elements[11] + ", " + camera.projectionMatrix.elements[15] + "]")
        console.log();
        console.log("uProjInverse : " + camera.projectionMatrix.clone().invert())
        console.log("[" + camera.projectionMatrix.clone().invert().elements[0] + ", " + camera.projectionMatrix.clone().invert().elements[4] + ", " + camera.projectionMatrix.clone().invert().elements[8] + ", " + camera.projectionMatrix.clone().invert().elements[12] + "]")
        console.log("[" + camera.projectionMatrix.clone().invert().elements[1] + ", " + camera.projectionMatrix.clone().invert().elements[5] + ", " + camera.projectionMatrix.clone().invert().elements[9] + ", " + camera.projectionMatrix.clone().invert().elements[13] + "]")
        console.log("[" + camera.projectionMatrix.clone().invert().elements[2] + ", " + camera.projectionMatrix.clone().invert().elements[6] + ", " + camera.projectionMatrix.clone().invert().elements[10] + ", " + camera.projectionMatrix.clone().invert().elements[14] + "]")
        console.log("[" + camera.projectionMatrix.clone().invert().elements[3] + ", " + camera.projectionMatrix.clone().invert().elements[7] + ", " + camera.projectionMatrix.clone().invert().elements[11] + ", " + camera.projectionMatrix.clone().invert().elements[15] + "]")
        console.log();
        console.log("uCaptureViewMatrix: " + this.view )
        console.log("[" + this.view.elements[0] + ", " + this.view.elements[4] + ", " + this.view.elements[8] + ", " + this.view.elements[12] + "]")
        console.log("[" + this.view.elements[1] + ", " + this.view.elements[5] + ", " + this.view.elements[9] + ", " + this.view.elements[13] + "]")
        console.log("[" + this.view.elements[2] + ", " + this.view.elements[6] + ", " + this.view.elements[10] + ", " + this.view.elements[14] + "]")
        console.log("[" + this.view.elements[3] + ", " + this.view.elements[7] + ", " + this.view.elements[11] + ", " + this.view.elements[15] + "]")
        console.log();
        console.log("uCaptureProjectionMatrix: " + this.projection )
        console.log("[" + this.projection.elements[0] + ", " + this.projection.elements[4] + ", " + this.projection.elements[8] + ", " + this.projection.elements[12] + "]")
        console.log("[" + this.projection.elements[1] + ", " + this.projection.elements[5] + ", " + this.projection.elements[9] + ", " + this.projection.elements[13] + "]")
        console.log("[" + this.projection.elements[2] + ", " + this.projection.elements[6] + ", " + this.projection.elements[10] + ", " + this.projection.elements[14] + "]")
        console.log("[" + this.projection.elements[3] + ", " + this.projection.elements[7] + ", " + this.projection.elements[11] + ", " + this.projection.elements[15] + "]")
        this.material.transparent = true;
        this.material.defines = { EPSILON: 0.0001, LARGE_FLOAT: 1000.0 };
        //create fire mesh
        this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
        this.mesh.position.set(0, 1, 0);
        this.mesh.rotateY(Math.PI);
        this.scene = scene;
        this.scene.add(this.mesh);
       

        this.counter = 0;
        this.clock = new THREE.Clock();
        this.deltaTime = 0;
        this.frameRate = JSONController.frameRate;
        this.numberOfFrames = JSONController.endFrame - JSONController.startFrame;
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

    update(camera){
        this.material.uniforms.uResolution.value = new THREE.Vector2(window.innerWidth, window.innerHeight);
        this.material.uniforms.uViewMatrix.value = camera.matrixWorldInverse;
        this.material.uniforms.uProjMatrix.value = camera.projectionMatrix;
        this.material.uniforms.uViewInverse.value = camera.matrixWorldInverse.clone().invert();
        this.material.uniforms.uProjInverse.value = camera.projectionMatrix.clone().invert();
        this.material.uniforms.uViewInverse.value = camera.matrixWorldInverse.clone().invert();
        this.material.uniforms.uProjInverse.value = camera.projectionMatrix.clone().invert();
        this.material.uniforms.uCaptureViewMatrix.value = this.view;
        this.material.uniforms.uCaptureProjMatrix.value = this.projection;
    }

}