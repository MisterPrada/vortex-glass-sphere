import * as THREE from 'three/webgpu'
import * as Helpers from '@experience/Utils/Helpers.js'
import Experience from '../Experience.js'

import normalizeWheel from 'normalize-wheel'
import Sizes from "./Sizes.js";

export default class Input {
    static _instance = null

    static getInstance() {
        return Input._instance || new Input()
    }

    constructor( parameters = {} ) {
        if ( Input._instance ) {
            return Input._instance
        }
        Input._instance = this

        this.experience = Experience.getInstance()
        this.sizes = Sizes.getInstance()
        this.camera = parameters.camera

        this.cursor = { x: 0, y: 0, side: 'left'}
        this.cursor3D = new THREE.Vector3()
        this.cursorDirection = new THREE.Vector3()
        this.clientX = 0
        this.clientY = 0

        this.init()
    }

    init() {
        window.addEventListener( 'mousemove', this._onMouseMoved)
        window.addEventListener( 'touchstart', this._onTouchStart)
        window.addEventListener( 'touchmove', this._onTouchMoved)
    }

    postInit() {

    }

    getNDCFrom3d(x, y, z) {
        const vector = new THREE.Vector3( x, y, z );
        vector.project( this.camera );
        return vector;
    }

    _onMouseMoved = ( event ) =>{
        this.clientX = event.clientX
        this.clientY = event.clientY

        this.cursor.x = event.clientX / this.sizes.width * 2 - 1
        this.cursor.y = -( event.clientY / this.sizes.height ) * 2 + 1
        this.cursor.side = event.clientX > this.sizes.width / 2 ? 'right' : 'left'

        this.previosCursor3D = this.cursor3D.clone()
        this.cursor3D = Helpers.projectNDCTo3D(this.cursor.x, this.cursor.y, this.camera)
        this.cursorDirection = this.cursor3D.clone().sub(this.previosCursor3D).normalize()
    }

    _onTouchStart = ( event ) => {
        this._onTouchMoved( event )
    }

    _onTouchMoved = ( event ) => {
        this.cursor.x = event.touches[ 0 ].clientX / this.sizes.width * 2 - 1
        this.cursor.y = -( event.touches[ 0 ].clientY / this.sizes.height ) * 2 + 1
        this.cursor.side = event.touches[ 0 ].clientX > this.sizes.width / 2 ? 'right' : 'left'

        this.previosCursor3D = this.cursor3D.clone()
        this.cursor3D = this.projectNDCTo3D(this.cursor.x, this.cursor.y)
        this.cursorDirection = this.cursor3D.clone().sub(this.previosCursor3D).normalize()
    }
}
