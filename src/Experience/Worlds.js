import Experience from '@experience/Experience.js'
import EventEmitter from '@experience/Utils/EventEmitter.js';

import MainWorld from '@experience/Worlds/MainWorld/MainWorld.js'
import Debug from "@experience/Utils/Debug.js";

export default class Worlds extends EventEmitter{
    debug = Debug.getInstance()

    constructor() {
        super();

        this.experience = Experience.getInstance()


        this.setupWorlds()
        this.setDebug()
    }

    setupWorlds() {
        // Setup
        this.mainWorld = new MainWorld()

        this.experience.mainScene = this.mainWorld.scene
        this.experience.mainCamera = this.mainWorld.camera


    }

    setDebug() {
        if ( !this.debug.active ) return

        const gizmo = this.experience.mainCamera.transformControls.getHelper();
        this.experience.mainScene.add( gizmo );
    }

    postInit() {
        this.mainWorld?.postInit()
        this.postProcess = this.experience.postProcess
    }

    animationPipeline() {
        this.mainWorld?.animationPipeline()
    }

    resize() {
        this.mainWorld?.resize()
    }

    update( deltaTime ) {
        this.mainWorld?.update( deltaTime )
    }

    postUpdate( deltaTime ) {
        this.mainWorld?.postUpdate( deltaTime )
    }
}
