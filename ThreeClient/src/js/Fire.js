import * as THREE from 'three';
import * as Loader from './Loader.js';
import {ShaderMaterial} from "three";
import {loadFireFromFrames} from "./Loader.js";

const vertex   = require(         '../glsl/vertex.glsl'          );
const fragment = require(         '../glsl/fragment.glsl'        );

export default class Fire{
    constructor(JSONController, parent, camera, scene, modelViewMats, projectionMats){

        this.parent = parent;
        this.camera = camera;
        this.scene = scene;

        //create fire mesh
        // this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(10.55,10.55));
        // this.mesh.position.set(0, 4.65, 0.75);

        this.light = new THREE.PointLight(0xccac77, 0.2, 100);
        this.light.position.set(0, 4.54, 0);
        this.scene.add(this.light);

        //only used when the fire is loaded as individual frames
        // this.atlases = Loader.loadFireFromFrames(JSONController);
        this.atlases = [[[]]];
 
        //adding fire meseh to the scene
        // this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
        // this.boundingBox.center(this.mesh.position);
        //this.mesh.position.multipyScalar(-1);

        this.counter = 0;
        this.clock = new THREE.Clock();
        this.deltaTime = 0;
        this.frameRate = JSONController.frameRate;
        this.numberOfFrames = JSONController.endFrame - JSONController.startFrame;
        this.resolutionXY = JSONController.resolutionXY;

        // Todo atlas variablen erstellen
        this.framesPerAtlas = 0

        // matrix4 arrays with size 4 for each perspective: F = 0, R = 1, B = 2, L = 3
        this.modelViewMats = modelViewMats;
        this.projectionMats = projectionMats;

        this.mesh = this.createSmokeDomain();

        this.currentPerspective = 0;


        // this.pivot = new THREE.Group();
        // this.scene.add(this.pivot);
        // this.pivot.add(this.mesh)

    }

    destroy(){
        // this.scene.remove(this.pivot);
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
        // let angle = Math.atan2(this.camera.position.z - this.mesh.position.z, this.camera.position.x - this.mesh.position.x) + Math.PI;
        let angle = Math.atan2(this.camera.position.z, this.camera.position.x) + Math.PI;
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

        console.log( this.getPerspective() );

        const perspective = this.getPerspective();

        if( this.mesh.material != null && this.currentPerspective != perspective )
            this.mesh.material.uniforms.uCamera.value.perspective = perspective;

        // //calculate angle of fire from camera position with pythagoras theorem
        // var angle = Math.atan(1/(Math.abs(this.camera.position.z) / Math.abs(this.camera.position.x)));
        // if(this.camera.position.x > 0  && this.camera.position.z < 0){
        //     angle = Math.PI / 2 + (Math.PI / 2 - angle);
        // }
        // if(this.camera.position.x < 0  && this.camera.position.z < 0){
        //     angle += Math.PI;
        // }
        // if(this.camera.position.x < 0  && this.camera.position.z > 0){
        //     angle = 3 * Math.PI / 2 + (Math.PI / 2 - angle);
        // }
        // //rotating fire around pivot point/parent object
        // this.pivot.rotation.y = angle;
        // //updating fire texture (only used when the fire is loaded as individual frames)

        // Todo load atlas rgba and z for perspectiv and actual frame to material or shader

        // console.log("Active perspective: " + this.getPerspective())
        //
        // this.deltaTime += this.clock.getDelta();
        // if(this.deltaTime > (1 / this.frameRate)){
        //     this.mesh.material = this.atlasMaterials[this.counter % this.numberOfFrames];
        //     this.counter++;
        //     this.deltaTime = this.deltaTime % (1/this.frameRate);
        // }
        
        
    }

    async createSmokeDomain() {

        this.atlases = await loadFireFromFrames();

        const smokeDomain = new THREE.Mesh();
        const smokeDomainSize = 1;
        const smokeDomainCenter = new THREE.Vector3( 0, 0, 0 );

        const smokeDomainMin = new THREE.Vector3(
            smokeDomainCenter.x - smokeDomainSize / 2,
            smokeDomainCenter.y - smokeDomainSize / 2,
            smokeDomainCenter.z - smokeDomainSize / 2
        );

        const smokeDomainMax = new THREE.Vector3(
            smokeDomainCenter.x + smokeDomainSize / 2,
            smokeDomainCenter.y + smokeDomainSize / 2,
            smokeDomainCenter.z + smokeDomainSize / 2
        );

        const smokeDomainRadius = new THREE.Vector3(
            smokeDomainSize / 2,
            smokeDomainSize / 2,
            smokeDomainSize / 2
        );

        const smokeDomainGeometry = new THREE.BoxGeometry(
            smokeDomainSize,
            smokeDomainSize,
            smokeDomainSize
        );

        const smokeDomainMaterial = new ShaderMaterial({
            uniforms: {
                uCamera: {
                    value: {
                        perspective:   this.getPerspective()
                    }
                },
                uFire: {
                    value: {
                        // atlasesRGBA_F:     this.atlases[0][0],
                        // atlasesZ_F:        this.atlases[1][0],
                        // atlasesRGBA_R:     this.atlases[0][1],
                        // atlasesZ_R:        this.atlases[1][1],
                        // atlasesRGBA_B:     this.atlases[0][2],
                        // atlasesZ_B:        this.atlases[1][2],
                        // atlasesRGBA_L:     this.atlases[0][3],
                        // atlasesZ_L:        this.atlases[1][3],
                        frame:             15,
                        resolutionXY:      this.resolutionXY,
                        atlasResolutionXY: 4096,
                        numberOfAtlases:   1
                    }
                },
                atlasesRGBA_F: { value:  this.atlases[0][0] },
                atlasesZ_F:    { value:  this.atlases[1][0] },
                atlasesRGBA_R: { value:  this.atlases[0][1] },
                atlasesZ_R:    { value:  this.atlases[1][1] },
                atlasesRGBA_B: { value:  this.atlases[0][2] },
                atlasesZ_B:    { value:  this.atlases[1][2] },
                atlasesRGBA_L: { value:  this.atlases[0][3] },
                atlasesZ_L:    { value:  this.atlases[1][3] },
                // atlasesRGBA_F:  {   this.atlases[0],
                // atlasesZ_F:        this.atlases[1],
                // atlasesRGBA_R:     this.atlases[0],
                // atlasesZ_R:        this.atlases[1],
                // atlasesRGBA_B:     this.atlases[0],
                // atlasesZ_B:        this.atlases[1],
                // atlasesRGBA_L:     this.atlases[0],
                // atlasesZ_L:        this.atlases[1],
            },
            vertexShader:   vertex,
            fragmentShader: fragment
        });

        smokeDomain.geometry = smokeDomainGeometry;
        smokeDomain.material = smokeDomainMaterial;
        smokeDomainMaterial.transparent = true;

        smokeDomain.position.x += 0.5;
        smokeDomain.position.y += 0.5;
        smokeDomain.position.z += 0.5;

        this.scene.add( smokeDomain );

        return smokeDomain;

    }

}