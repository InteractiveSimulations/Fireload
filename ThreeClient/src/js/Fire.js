import * as THREE from 'three';
import * as Loader from './Loader.js';
import {ShaderMaterial} from "three";
import {loadFireFromFrames} from "./Loader.js";

const vertex   = require(         '../glsl/vertex.glsl'          );
const fragment = require(         '../glsl/fragment.glsl'        );

export default class Fire{
    constructor(JSONController, parent, camera, scene,controller, modelViewMats, projectionMats){

        this.parent = parent;
        this.camera = camera;
        this.scene = scene;
        this.controller = controller;

        this.currentCameraPosition = this.camera.position.clone();
        this.currentPerspective    = 0;

        this.light = new THREE.PointLight(0xccac77, 0.2, 100);
        this.light.position.set(0, 4.54, 0);
        this.scene.add(this.light);

        this.mesh = new THREE.Mesh();

        this.currentFrame   = 1;
        this.clock          = new THREE.Clock();
        this.deltaTime      = 0;
        this.frameRate      = JSONController.frameRate;
        this.numberOfFrames = JSONController.endFrame - JSONController.startFrame + 1;
        this.resolutionXY   = JSONController.resolutionXY;

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
        this.scene.remove(this.mesh);
    }

    getMesh(){
        return this.mesh;
    }

    async addFireToScene(){
        await this.createSmokeDomain();
        this.scene.add(this.mesh);
    }

    // returns index of the perspective that needs to be loaded into the shader
    getPerspective(){
        //calculate angle of fire from camera position with pythagoras theorem
        let angle = Math.atan2(this.camera.position.z - this.mesh.position.z, this.camera.position.x - this.mesh.position.x) + Math.PI;
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

        if ( this.mesh != null && this.mesh.material != null && this.mesh.material.uniforms != null ) {

            if ( !this.currentCameraPosition.equals( this.camera.position ) ) {

                const newPerspective = this.getPerspective();

                if( newPerspective !== this.currentPerspective ) {

                    let del = newPerspective + 2
                    let add = this.currentPerspective + 2;

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

                    this.mesh.material.uniforms.uCamera.value.perspective = newPerspective;

                    this.mesh.material.uniforms.uFire.value.atlasesRGBA[del] = null;
                    this.mesh.material.uniforms.uFire.value.atlasesRGBA[add] = this.atlases[0][add][this.currentAtlas];
                    this.mesh.material.uniforms.uFire.value.atlasesZ[del]    = null;
                    this.mesh.material.uniforms.uFire.value.atlasesZ[add]    = this.atlases[0][add][this.currentAtlas];

                    this.mesh.material.needsUpdate = true;

                    console.log( "current: " + this.currentPerspective + ", new: " + newPerspective + ", del: " + del + ", add: " + add );

                    this.currentPerspective = newPerspective;
                }

                this.currentCameraPosition = this.camera.position.clone();

            }

            this.deltaTime += this.clock.getDelta();
            if (this.deltaTime > (1 / this.frameRate)) {

                // loop
                if (  this.currentFrame  % ( this.numberOfFrames + 1 ) === 0 )
                    this.currentFrame = 1;

                let currentAtlasEndFrame = this.framesPerAtlas * ( this.currentAtlas + 1 );

                if( this.currentFrame % ( currentAtlasEndFrame + 1 ) === 0 && this.numberOfAtlases !== 1 ) {

                    this.currentAtlas++;

                    let perspective    = this.currentPerspective
                    let leftNeighbour  = perspective - 1;
                    let rightNeighbour = perspective + 1;

                    if ( leftNeighbour  === -1 )
                        leftNeighbour  = 3;
                    if ( rightNeighbour ===  4 )
                        rightNeighbour = 0;

                    this.mesh.material.uniforms.uFire.value.atlasesRGBA[ perspective    ] = this.atlases[0][ perspective   ][this.currentAtlas];
                    this.mesh.material.uniforms.uFire.value.atlasesRGBA[ leftNeighbour  ] = this.atlases[0][ leftNeighbour ][this.currentAtlas];
                    this.mesh.material.uniforms.uFire.value.atlasesRGBA[ rightNeighbour ] = this.atlases[0][ rightNeighbour][this.currentAtlas];

                    this.mesh.material.uniforms.uFire.value.atlasesZ[ perspective    ] = this.atlases[1][ perspective   ][this.currentAtlas];
                    this.mesh.material.uniforms.uFire.value.atlasesZ[ leftNeighbour  ] = this.atlases[1][ leftNeighbour ][this.currentAtlas];
                    this.mesh.material.uniforms.uFire.value.atlasesZ[ rightNeighbour ] = this.atlases[1][ rightNeighbour][this.currentAtlas];

                    this.mesh.material.needsUpdate = true;

                }

                this.mesh.material.uniforms.uFire.value.frame = this.currentFrame;
                this.currentFrame++;
                this.deltaTime = this.deltaTime % (1 / this.frameRate);

            }

        }
        
    }

    async createSmokeDomain() {

        this.atlases = await loadFireFromFrames();

        const smokeDomainSize = 10;
        const smokeDomainCenter = new THREE.Vector3( 0, 0, 0 );

        let smokeDomain = new THREE.Mesh();
        smokeDomain.position.y += 5;

        this.mesh = smokeDomain;
        this.currentPerspective = this.getPerspective();

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

        const atlasesRGBA = [];
        const atlasesZ    = [];

        for (  let p = 0; p < 4; p++ ) {
            atlasesRGBA.push( this.atlases[0][p][0] );
            atlasesZ.push(    this.atlases[1][p][0] );
        }

        const smokeDomainMaterial = new ShaderMaterial({
            uniforms: {
                uCamera: {
                    value: {
                        perspective:   this.currentPerspective
                    }
                },
                uFire: {
                    value: {
                        atlasesRGBA: atlasesRGBA,
                        atlasesZ: atlasesZ,
                        frame:             15,
                        resolutionXY:      this.resolutionXY,
                        atlasResolutionXY: 4096,
                        numberOfAtlases:   1
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