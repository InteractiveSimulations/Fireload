
import * as THREE from 'three';
import * as Loader from './Loader.js';
export default class ParallaxFireMaterial{
    constructor(shader, camera){
        this.view = new THREE.Matrix4();
        this.view.set( 
        0, 0, -1, -37.7278,
        -1, 0, 0, 0,
        0, 1, 0, 10,
        0, 0, 0, 1);

        this.projection = new THREE.Matrix4();
        this.projection.set( 
        2.7778, 0, 0, 0,
        0, 2.7778, 0, 0,
        0, 0, -1.0020, -0.2002,
        0, 0, -1, 0);
        
        this.textures = Loader.loadParallaxFireTextures();
        console.log(this.textures.length);

        this.material = new THREE.ShaderMaterial( {
            /*uniforms: { 
                //resolution of three.js
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                uViewMatrix: { value: camera.matrixWorldInverse },
                uProjMatrix: { value: camera.projectionMatrix },
                uViewInverse: { value: camera.matrixWorldInverse.clone().invert() },
                uHeightfieldTex: { value: this.textures[1] },
                uRadianceTex: { value: this.textures[0] },
                uCaptureViewMatrix: { value: this.view },
                uCaptureProjMatrix: { value: this.projection }f
            },
            */
            vertexShader: shader[0],
            fragmentShader: shader[1]
        })
    }

    getMaterial(){
        return this.material;
    }
}