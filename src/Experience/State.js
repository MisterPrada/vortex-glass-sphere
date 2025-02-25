import * as THREE from 'three/webgpu'
import Experience from './Experience.js'
import Sizes from "./Utils/Sizes.js"

export default class State {
    static _instance = null

    static getInstance() {
        return State._instance || new State()
    }

    experience = Experience.getInstance()
    renderer = this.experience.renderer.instance
    postprocessing = false;
    //floatType = this.renderer.capabilities.isWebGL2 ? THREE.FloatType : THREE.HalfFloatType;

    unrealBloom = {
        enabled: true,
        strength: 2.5,
        radius: 0.5,
        threshold: 0.0,
    }

    constructor() {
        // Singleton
        if ( State._instance ) {
            return State._instance
        }
        State._instance = this

        this.experience = Experience.getInstance()
        this.renderer = this.experience.renderer.instance
        this.canvas = this.experience.canvas
        this.sizes = Sizes.getInstance()

        this.setLayers()
    }

    setLayers() {
        this.layersConst = {
            BLOOM_SCENE: 1,
            DEFAULT: 0,
        }
        this.bloomLayer = new THREE.Layers();
        this.bloomLayer.set( this.layersConst.BLOOM_SCENE );
    }

    resize() {

    }
}
