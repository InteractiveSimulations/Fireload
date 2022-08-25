import * as THREE from 'three';
import * as Loader from './Loader.js';
import {ShaderMaterial} from "three";
import {loadFireAtlases} from "./Loader.js";

const vertex   = require(         '../glsl/vertex.glsl'          );
const fragment = require(         '../glsl/fragment.glsl'        );

export default class Fire{
    constructor(JSONController, parent, camera, scene,controller, modelViewMats, projectionMats){

        this.parent = parent;
        this.camera = camera;
        this.scene = scene;
        this.controller = controller;

        this.lastCameraPosition = this.camera.position.clone();
        this.lastPerspective    = 0;

        this.light = new THREE.PointLight(0xccac77, 0.2, 100);
        this.light.position.set(0, 4.54, 0);
        this.scene.add(this.light);

        this.smokeDomain = new THREE.Mesh();

        // parameters for frame access
        this.currentFrame   = 1;
        this.clock          = new THREE.Clock();
        this.deltaTime      = 0;
        this.frameRate      = JSONController.frameRate;
        this.numberOfFrames = JSONController.endFrame - JSONController.startFrame + 1;
        this.resolutionXY   = JSONController.resolutionXY;
        this.compression    = JSONController.compression;

        this.atlases         = [[[]]];
        this.currentAtlas    = 0;
        this.framesPerAtlas  = ( 4096 / this.resolutionXY ) * ( 4096 / this.resolutionXY );
        this.numberOfAtlases = Math.ceil( this.numberOfFrames / this.framesPerAtlas   );

        // matrix4 arrays with size 4 for each perspective: F = 0, R = 1, B = 2, L = 3
        this.modelViewMats  = modelViewMats;
        this.projectionMats = projectionMats;

        const axesHelper = new THREE.AxesHelper(20);
        this.scene.add( axesHelper );

        this.addFireToScene();

    }

    destroy(){
        this.scene.remove(this.smokeDomain);
    }

    getMesh(){
        return this.smokeDomain;
    }

    /**
     * Adds fire simulation to this scene after all resources are loaded.
     */
    async addFireToScene(){
        await this.createSmokeDomain();
        this.scene.add(this.smokeDomain);
    }

    // returns index of the perspective that needs to be loaded into the shader
    getPerspective(){
        //calculate angle of fire from camera position with pythagoras theorem
        let angle = Math.atan2(this.camera.position.z - this.smokeDomain.position.z, this.camera.position.x - this.smokeDomain.position.x) + Math.PI;
        // let angle = Math.atan2(this.camera.position.z, this.camera.position.x) + Math.PI;
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

        // checks if smoke domain and parameters are already set
        if ( this.smokeDomain != null && this.smokeDomain.material != null && this.smokeDomain.material.uniforms != null ) {

            // checks if camera position has changed
            if ( !this.lastCameraPosition.equals( this.camera.position ) ) {

                // calculate the current atlas perspective
                const newPerspective = this.getPerspective();

                // check if perspective has changed
                if( newPerspective !== this.lastPerspective ) {

                    // indices for deleting atlas perspective, which is on the opposite side of the new perspective
                    let del = newPerspective + 2
                    // indices for loading a new atlas perspective
                    let add = this.lastPerspective + 2;

                    if ( del > 3 ) {
                        if ( del === 4 )
                            del = 0;
                        else
                            del = 1;
                    }

                    if ( add > 3 ) {
                        if ( add === 4 )
                            add = 0;
                        else
                            add = 1;
                    }

                    // update perspective uniform
                    this.smokeDomain.material.uniforms.uCamera.value.perspective = newPerspective;

                    // loads the new calculated atlas perspective and its neighbours, deletes the opposite side of the new perspective
                    // loading only 6 texture, instead of 8 into the GPU.
                    // example: newPerspective -> front, add neighbours -> left and right, delete -> back
                    this.smokeDomain.material.uniforms.uFire.value.atlasesRGBA[del] = null;
                    this.smokeDomain.material.uniforms.uFire.value.atlasesRGBA[add] = this.atlases[0][add][this.currentAtlas];
                    this.smokeDomain.material.uniforms.uFire.value.atlasesZ[del]    = null;
                    this.smokeDomain.material.uniforms.uFire.value.atlasesZ[add]    = this.atlases[0][add][this.currentAtlas];

                    this.smokeDomain.material.needsUpdate = true;

                    this.lastPerspective = newPerspective;

                }

                this.lastCameraPosition = this.camera.position.clone();

            }

            // delta time for frame counting
            this.deltaTime += this.clock.getDelta();

            // checks if the next frame is reached
            if (this.deltaTime > (1 / this.frameRate)) {

                // loop simulation
                if (  this.currentFrame  % ( this.numberOfFrames + 1 ) === 0 )
                    this.currentFrame = 1;

                let currentAtlasEndFrame = this.framesPerAtlas * ( this.currentAtlas + 1 );

                // checks if current atlas is finished
                if( this.currentFrame % ( currentAtlasEndFrame + 1 ) === 0 && this.numberOfAtlases !== 1 ) {

                    this.currentAtlas++;

                    // switch to next atlases depending on current perspective
                    let perspective    = this.lastPerspective
                    let leftNeighbour  = perspective - 1;
                    let rightNeighbour = perspective + 1;

                    if ( leftNeighbour  === -1 )
                        leftNeighbour  = 3;
                    if ( rightNeighbour ===  4 )
                        rightNeighbour = 0;

                    this.smokeDomain.material.uniforms.uFire.value.atlasesRGBA[ perspective    ] = this.atlases[0][ perspective   ][this.currentAtlas];
                    this.smokeDomain.material.uniforms.uFire.value.atlasesRGBA[ leftNeighbour  ] = this.atlases[0][ leftNeighbour ][this.currentAtlas];
                    this.smokeDomain.material.uniforms.uFire.value.atlasesRGBA[ rightNeighbour ] = this.atlases[0][ rightNeighbour][this.currentAtlas];

                    this.smokeDomain.material.uniforms.uFire.value.atlasesZ[ perspective    ] = this.atlases[1][ perspective   ][this.currentAtlas];
                    this.smokeDomain.material.uniforms.uFire.value.atlasesZ[ leftNeighbour  ] = this.atlases[1][ leftNeighbour ][this.currentAtlas];
                    this.smokeDomain.material.uniforms.uFire.value.atlasesZ[ rightNeighbour ] = this.atlases[1][ rightNeighbour][this.currentAtlas];

                    this.smokeDomain.material.needsUpdate = true;

                }

                // set frame current number for shader
                this.smokeDomain.material.uniforms.uFire.value.frame = this.currentFrame;
                this.currentFrame++;
                this.deltaTime = this.deltaTime % (1 / this.frameRate);

            }

        }
        
    }

    /**
     * Creates the smoke domain and sets all shader uniforms after all atlases are loaded from the server.
     */
    async createSmokeDomain() {

        // load atlases from server
        this.atlases = await loadFireAtlases( this.compression );

        // set smoke domain parameters
        const smokeDomainSize = 10;
        const smokeDomainCenter = new THREE.Vector3( 0, 0, 0 );

        let smokeDomain = new THREE.Mesh();
        smokeDomain.position.y += 5;

        this.smokeDomain        = smokeDomain;
        this.lastPerspective = this.getPerspective();

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

        // prepare atlas arrays for shader
        const atlasesRGBA = [];
        const atlasesZ    = [];

        for (  let p = 0; p < 4; p++ ) {
            atlasesRGBA.push( this.atlases[0][p][0] );
            atlasesZ.push(    this.atlases[1][p][0] );
        }

        // shader material with all uniforms and vertex and fragment shader
        const smokeDomainMaterial = new ShaderMaterial({
            uniforms: {
                uCamera: {
                    value: {
                        perspective:   this.lastPerspective
                    }
                },
                uFire: {
                    value: {
                        atlasesRGBA: atlasesRGBA,
                        atlasesZ: atlasesZ,
                        frame:             1,
                        resolutionXY:      this.resolutionXY,
                        atlasResolutionXY: 4096,
                        numberOfAtlases:   this.numberOfAtlases
                    }
                },
            },
            vertexShader:   vertex,
            fragmentShader: fragment
        });

        smokeDomainMaterial.transparent = true;

        smokeDomain.material = smokeDomainMaterial;
        smokeDomain.geometry = smokeDomainGeometry;

    }

}