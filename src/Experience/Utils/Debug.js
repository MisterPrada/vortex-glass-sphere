import * as THREE from 'three/webgpu'
import * as Helpers from '@experience/Utils/Helpers.js'
import Stats from 'stats.js'
import { Pane } from 'tweakpane';
import Experience from "@experience/Experience.js";
import Sizes from "./Sizes.js";

import {
    output, mrt
} from 'three/tsl'

export default class Debug {

    static _instance = null

    static getInstance() {
        return Debug._instance || new Debug()
    }

    experience = Experience.getInstance()
    sizes = Sizes.getInstance()

    constructor() {
        // Singleton
        if ( Debug._instance ) {
            return Debug._instance
        }
        Debug._instance = this

        //this.active = window.location.hash === '#debug'
        this.active = true

        if ( this.active ) {
            this.panel = new Pane({
                title: 'Debug',
                container: document.getElementById('debug-panel'),
            });

            this.stats = new Stats()
            this.stats.showPanel( 0 );

            //document.body.appendChild( this.stats.dom )
        }
    }

    postInit() {
        this.scene = experience.scene
        //this.camera = this.experience.camera.instance
    }

    createDebugTexture( texture, world ) {
        this.debugTexture = texture;
        this.world = world;
        this.scene = world.scene;
        this.camera = world.camera.instance;

        const material = new THREE.SpriteNodeMaterial( {
            map: texture,
            // depthWrite: false,
            depthTest: false,
            // //blending: THREE.NoBlending
            toneMapped: false
        } );

        // material.mrtNode = mrt({
        //     output
        // });

        //material.colorNode = vec4(1, 1, 1, 1);
        // material.fragmentNode = Fn(() =>
        // {
        //     return texture( this.resources.items.displacementTexture, uv() )
        // })()

        const sprite = this.sprite = new THREE.Sprite( material );
        sprite.center.set( 0.0, 0.0 );
        sprite.renderOrder = 10000;

        this.scene.add(sprite);

        this._updateSprite();
    }

    _updateSprite() {
        if ( !this.debugTexture ) return;

        const position = Helpers.projectNDCTo3D(-1, -1, this.camera, 10)
        this.sprite.position.copy( position )
    }

    resize() {
        this._updateSprite();
    }

    update( deltaTime ) {
        if ( this.debugTexture ) {
            this._updateSprite()
        }
    }
}
