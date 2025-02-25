import * as THREE from 'three/webgpu'
import Experience from '@experience/Experience.js'
import Debug from '@experience/Utils/Debug.js'
import State from "@experience/State.js";

export default class Materials {
    static _instance = null

    static getInstance() {
        return Materials._instance || new Materials()
    }

    constructor() {
        if ( Materials._instance ) {
            return Materials._instance
        }
        Materials._instance = this

        this.experience = Experience.getInstance()
        this.debug = Debug.getInstance()
        this.state = State.getInstance()

        this.materials = {}
    }
}

