import * as THREE from 'three'
import Experience from '@experience/Experience.js'
import DebugHelpers from "../Objects/DebugHelpers.js";
import Time from "@experience/Utils/Time.js";
import EventEmitter from '@experience/Utils/EventEmitter.js';

import Camera from './Camera.js'
import Input from "@experience/Utils/Input.js";
import Environment from "./Environment.js";

import Sphere from "./Sphere.js";
import Galaxy from "./Galaxy.js";

export default class MainWorld extends EventEmitter{
    constructor() {
        super();

        this.experience = Experience.getInstance()
        this.time = Time.getInstance()
        this.renderer = this.experience.renderer.instance
        this.scene = new THREE.Scene()
        this.camera = new Camera( { scene: this.scene } )
        this.input = new Input( { camera: this.camera.instance } )
        this.resources = this.experience.resources
        this.html = this.experience.html
        this.sound = this.experience.sound
        this.debug = this.experience.debug.panel

        this.enabled = true

        this.galaxy = new Galaxy( { world: this } )
        this.sphere = new Sphere( { world: this } )

        this.environment = new Environment( { world: this } )
        //this.debugHelpers = new DebugHelpers( { world: this } )

        this.scene.add( this.camera.instance )
    }

    animationPipeline() {
        this.example?.animationPipeline()
        this.sphere?.animationPipeline()
        this.galaxy?.animationPipeline()
    }

    postInit() {
        this.example?.postInit()
        this.sphere?.postInit()
        this.galaxy?.postInit()
    }

    resize() {
        this.example?.resize()
        this.sphere?.resize()
        this.galaxy?.resize()

        this.camera?.resize()
    }

    update( deltaTime ) {
        if ( !this.enabled )
            return

        this.debugHelpers?.update( deltaTime )
        this.example?.update( deltaTime )
        this.sphere?.update( deltaTime )
        this.galaxy?.update( deltaTime )

        this.camera?.update()
    }

    postUpdate( deltaTime ) {

    }
}
