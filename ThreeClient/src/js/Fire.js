import * as THREE from 'three';
import * as Loader from './Loader.js';
import {ShaderMaterial} from "three";
import {loadFireAtlases} from "./Loader.js";
import * as SCRIPT from './script'

const vertex   = require(         '../glsl/vertex.glsl'          );
const fragment = require(         '../glsl/fragment.glsl'        );
/*!
    @author David Palm, Steffen-Sascha Stein, Nataliya Elchina
    This class controls the visualization of the fire simulation provided through images.
 */
export default class Fire{
    constructor(JSONController, camera, scene, controller, modelViewMats, projectionMats){

        this.camera = camera;
        this.scene = scene;
        this.controller = controller;

        this.light = new THREE.PointLight(0xccac77, 0.2, 100);
        this.light.position.set(0, 4.54, 0);
        this.scene.add(this.light);

        // set smoke domain parameters
        this.smokeDomain             = new THREE.Mesh();
        this.smokeDomainSize         = 10;
        this.smokeDomainCenter       = new THREE.Vector3( 0, 5, 0 );
        this.smokeDomain.position.y += 5;

        this.lastCameraPosition = this.camera.position.clone();
        this.lastPerspective    = this.getPerspective();

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

        this.dummy = JSONController.dummy;
        if ( this.dummy )
            this.resolutionXY = 1024;

        // matrix4 arrays with size 4 for each perspective: F = 0, R = 1, B = 2, L = 3
        this.modelViewMats  = modelViewMats;
        this.projectionMats = projectionMats;

        this.captureCameras = [];

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

        await this.createCaptureCameras();
        await this.createSmokeDomain();
        this.scene.add(this.smokeDomain);

    }

    // returns index of the perspective that needs to be loaded into the shader
    getPerspective(){

        //calculate angle of fire from camera position with pythagoras theorem
        let angle = Math.atan2(this.camera.position.z - this.smokeDomain.position.z, this.camera.position.x - this.smokeDomain.position.x) + Math.PI;

        let perspective = -1;
        if(angle <= Math.PI/4 * 1 | angle >= Math.PI/4 * 7){
            perspective = 3;
        }
        if(angle <= Math.PI/4 * 3 && angle >= Math.PI/4 * 1){
            perspective = 2;
        }
        if(angle <= Math.PI/4 * 5 && angle >= Math.PI/4 * 3){
            perspective = 1;
        }
        if(angle <= Math.PI/4 * 7 && angle >= Math.PI/4 * 5){
            perspective = 0;
        }
        return perspective;

    }

    update(){

        // checks if smoke domain and parameters are already set
        if ( this.smokeDomain != null && this.smokeDomain.material != null && this.smokeDomain.material.uniforms != null ) {

            this.updateCameraUniforms();

            // checks if camera position has changed
            if ( !this.lastCameraPosition.equals( this.camera.position ) ) {

                this.lastCameraPosition = this.camera.position.clone();

                // calculate the current atlas perspective
                const newPerspective = this.getPerspective();

                // check if perspective has changed
                if( newPerspective !== this.lastPerspective ) {

                    this.perspectiveAtlasSwitching( newPerspective );

                    this.lastPerspective = newPerspective;

                }

            }

            // delta time for frame counting
            this.deltaTime += this.clock.getDelta();

            // checks if the next frame is reached
            if (this.deltaTime > (1 / this.frameRate)) {

                // loop simulation
                if (  this.currentFrame  % ( this.numberOfFrames + 1 ) === 0 ) {
                    this.currentFrame = 1;
                    this.currentAtlas = 0;
                }

                let currentAtlasEndFrame = this.framesPerAtlas * ( this.currentAtlas + 1 );

                // checks if current atlas is finished
                if( this.currentFrame % ( currentAtlasEndFrame + 1 ) === 0 && this.numberOfAtlases !== 1 ) {

                    this.currentAtlas++;

                    this.animationAtlasSwitching()

                }

                // set frame current number for shader
                this.smokeDomain.material.uniforms.uFire.value.atlasFrame = ( this.currentFrame - 1 ) % this.framesPerAtlas + 1;
                this.currentFrame++;
                this.deltaTime = this.deltaTime % (1 / this.frameRate);

            }

        }
        
    }

    /**
     * Updates camera uniforms to keep vertex and fragment shader in an actual state.
     */
    updateCameraUniforms() {

        this.camera.updateProjectionMatrix()
        this.smokeDomain.material.uniforms.uCamera.value.view          = this.camera.matrixWorldInverse;
        this.smokeDomain.material.uniforms.uCamera.value.viewInv       = this.camera.matrixWorld;
        this.smokeDomain.material.uniforms.uCamera.value.projection    = this.camera.projectionMatrix;
        this.smokeDomain.material.uniforms.uCamera.value.projectionInv = this.camera.projectionMatrixInverse;

    }

    /**
     * Switches the loaded atlases dependent on the current perspective.
     * The atlases (RGBA and Z) of the opposite side of the perspective will not be loaded.
     * @param {number} newPerspective - front: 0, right: 1, back: 2, left: 2.
     */
    perspectiveAtlasSwitching(newPerspective ) {

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
        this.smokeDomain.material.uniforms.uFire.value.atlasesZ[add]    = this.atlases[1][add][this.currentAtlas];

        // this.smokeDomain.material.needsUpdate = true;

    }

    /**
     * Switching all atlases if the current frame reached the current atlas end frame.
     * This will also take the current perspective into account and won't load the atlases (RGBA and Z) of the
     * opposite side of the current perspective.
     */
    animationAtlasSwitching() {

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

        // this.smokeDomain.material.needsUpdate = true;

    }

    /**
     * Creates the smoke domain and sets all shader uniforms after all atlases are loaded from the server.
     */
    async createSmokeDomain() {

        // load atlases from server
        this.atlases = await loadFireAtlases( this.compression, this.dummy );

        const captureCamData = [];

        for ( let p = 0; p < this.captureCameras.length; p++ ) {

            const captureCam = this.captureCameras[p];

            captureCamData.push(
                {
                    view:          captureCam.matrixWorldInverse,
                    viewInv:       captureCam.matrixWorld,
                    projection:    captureCam.projectionMatrix,
                    projectionInv: captureCam.projectionMatrixInverse
                }
            )

        }

        const smokeDomainMin = new THREE.Vector3(
            this.smokeDomainCenter.x - this.smokeDomainSize / 2,
            this.smokeDomainCenter.y - this.smokeDomainSize / 2,
            this.smokeDomainCenter.z - this.smokeDomainSize / 2
        );

        const smokeDomainMax = new THREE.Vector3(
            this.smokeDomainCenter.x + this.smokeDomainSize / 2,
            this.smokeDomainCenter.y + this.smokeDomainSize / 2,
            this.smokeDomainCenter.z + this.smokeDomainSize / 2
        );

        const smokeDomainRadius = new THREE.Vector3(
            this.smokeDomainSize / 2,
            this.smokeDomainSize / 2,
            this.smokeDomainSize / 2
        );

        const smokeDomainGeometry = new THREE.BoxGeometry(
            this.smokeDomainSize,
            this.smokeDomainSize,
            this.smokeDomainSize
        );

        // prepare atlas arrays for shader
        const atlasesRGBA = [];
        const atlasesZ    = [];

        // pushes the first atlas of each perspective
        for (  let p = 0; p < 4; p++ ) {
            atlasesRGBA.push( this.atlases[0][p][0] );
            atlasesZ.push(    this.atlases[1][p][0] );
        }

        // shader material with all uniforms and vertex and fragment shader
        const smokeDomainMaterial = new ShaderMaterial({
            uniforms: {
                uWindow: {
                    value: {
                        resolution: SCRIPT.renderer.getSize( new THREE.Vector2() ),
                        pixelRatio: SCRIPT.renderer.getPixelRatio()
                    }
                },
                uCamera: {
                    value: {
                        view:          this.camera.matrixWorldInverse,
                        viewInv:       this.camera.matrixWorld,
                        projection:    this.camera.projectionMatrix,
                        projectionInv: this.camera.projectionMatrixInverse,
                        perspective:   this.lastPerspective
                    }
                },
                uCaptureCameras: {
                    value: captureCamData
                },
                uFire: {
                    value: {
                        smokeDomain: {
                            min:    smokeDomainMin,
                            max:    smokeDomainMax,
                            center: this.smokeDomainCenter,
                            radius: smokeDomainRadius
                        },
                        atlasesRGBA:       atlasesRGBA,
                        atlasesZ:          atlasesZ,
                        atlasFrame:        1,
                        resolutionXY:      this.resolutionXY,
                        atlasResolutionXY: 4096,
                        numberOfAtlases:   this.numberOfAtlases
                    }
                },
            },
            vertexShader:   vertex,
            fragmentShader: fragment
        });

        smokeDomainMaterial.transparent       = true;
        this.smokeDomain.material.needsUpdate = true;

        this.smokeDomain.material = smokeDomainMaterial;
        this.smokeDomain.geometry = smokeDomainGeometry;

    }

    /**
     * Creates cameras for each perspective of the smoke domain: front, right, left back.
     * These cameras simulate the capture cameras of the simulations rendering process and provide
     * the matrices for parallax occlusion mapping.
     * @return {Promise<void>}
     */
    async createCaptureCameras() {

        const aspectRatio = 1;
        const fovDeg      = 45;
        const fovRad      = THREE.MathUtils.degToRad( fovDeg );
        const distance    = ( this.smokeDomainSize/ 2.0 ) / ( Math.tan( 0.5 * fovRad ) ) + 0.5 * this.smokeDomainSize;
        const near        = distance - this.smokeDomainSize / 2;
        const far         = distance + this.smokeDomainSize / 2;

        const frontCapture = new THREE.PerspectiveCamera( fovDeg, aspectRatio, near, far );
        frontCapture.position.set( this.smokeDomainCenter.x, this.smokeDomainCenter.y, this.smokeDomainCenter.z + distance );
        frontCapture.lookAt( this.smokeDomainCenter );
        frontCapture.updateProjectionMatrix()
        this.captureCameras.push( frontCapture );

        const rightCapture = new THREE.PerspectiveCamera( fovDeg, aspectRatio, near, far );
        rightCapture.position.set( this.smokeDomainCenter.x + distance, this.smokeDomainCenter.y, this.smokeDomainCenter.z);
        rightCapture.lookAt( this.smokeDomainCenter );
        rightCapture.updateProjectionMatrix()
        this.captureCameras.push( rightCapture );

        const backCapture = new THREE.PerspectiveCamera( fovDeg, aspectRatio, near, far );
        backCapture.position.set( this.smokeDomainCenter.x, this.smokeDomainCenter.y, this.smokeDomainCenter.z - distance );
        backCapture.lookAt( this.smokeDomainCenter );
        backCapture.updateProjectionMatrix()
        this.captureCameras.push( backCapture );

        const leftCapture = new THREE.PerspectiveCamera( fovDeg, aspectRatio, near, far );
        leftCapture.position.set( this.smokeDomainCenter.x - distance, this.smokeDomainCenter.y, this.smokeDomainCenter.z );
        leftCapture.lookAt( this.smokeDomainCenter );
        leftCapture.updateProjectionMatrix()
        this.captureCameras.push( leftCapture );

        for ( let p = 0; p < this.captureCameras.length; p++ )
            this.scene.add( this.captureCameras[p] );



    }

}