import * as THREE from 'three/webgpu'
import * as Helpers from '@experience/Utils/Helpers.js'
import Experience from '@experience/Experience.js'
import Debug from '@experience/Utils/Debug.js'
import State from "@experience/State.js";
import Sizes from "./Sizes.js";
import Materials from "@experience/Materials/Materials.js";
import gsap from "gsap";

import {
    luminance,
    cos,
    float,
    min,
    time,
    atan,
    uniform,
    pass,
    mrt,
    output,
    emissive,
    diffuseColor,
    PI,
    PI2,
    color,
    positionLocal,
    oneMinus,
    sin,
    texture,
    Fn,
    uv,
    spherizeUV,
    screenUV,
    screenCoordinate,
    vec2,
    vec3,
    vec4,
    distance,
    transmission
} from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { transition } from 'three/addons/tsl/display/TransitionNode.js';


export default class PostProcess {
    experience = Experience.getInstance()
    debug = Debug.getInstance()
    sizes = Sizes.getInstance()
    state = State.getInstance()
    materials = Materials.getInstance()

    rendererClass = this.experience.renderer
    scene = experience.scene
    time = experience.time
    resources = experience.resources
    timeline = experience.time.timeline;
    container = new THREE.Group();
    passes = {}

    uniforms = {
        transitionPassParams: {
            progress: uniform( 0 ), // progress 0 -> 1
            threshold: uniform( 0.1 ), // threshold
            useTexture: uniform( 1 ), // use texture
            uvScale: uniform( vec2( 1, 1 ) ),
            uvOffset: uniform( vec2( 0, 0 ) ),
            uvMultiplier: uniform( 2 ),
        },
        uResolution: uniform( vec2( this.sizes.width_DPR, this.sizes.height_DPR ) )
    }

    transitionPassParams = {
        progress: uniform( 0 ), // progress 0 -> 1
        threshold: uniform( 0.1 ), // threshold
        useTexture: uniform( 1 ), // use texture
        uvScale: uniform( vec2( 1, 1 ) ),
        uvOffset: uniform( vec2( 0, 0 ) )
    }

    constructor( renderer ) {
        this.renderer = renderer
    }

    postInit() {
        this.worlds = this.experience.worlds
        this.preloadWorld = this.worlds.preloadWorld
        this.mainWorld = this.worlds.mainWorld

        this.setComposer()
        this.setDebug()
    }

    setComposer() {
        const composer = this.composer = new THREE.PostProcessing( this.renderer );

        //this._scenePreloadPass()
        this._sceneMainPass()
        //this._transitionPass() // Transition Pass (Preload -><- Main)


        //composer.outputNode = scenePassColorMain.add( ...Object.values( this.passes ) );
        //composer.outputNode = scenePassPreload
        composer.outputNode = this.scenePassMainFinalColor

        //composer.outputColorTransform = false
    }

    // Preload Scene
    _scenePreloadPass() {
        this.scenePassPreload = pass( this.preloadWorld.scene, this.preloadWorld.camera.instance, {} );
        this.scenePassPreloadFinalColor = this.scenePassPreload.getTextureNode( 'output' );
    }

    // Main Scene
    _sceneMainPass() {
        const scenePassMain = this.scenePassMain = pass( this.mainWorld.scene, this.mainWorld.camera.instance, {} );
        scenePassMain.setMRT( mrt( {
            output,
            emissive
        } ) );

        this.scenePassColorMain = scenePassMain.getTextureNode( 'output' );
        this.emissivePassMain = scenePassMain.getTextureNode( 'emissive' );

        // Bloom Pass for Main Scene
        this.bloomPassMain = this.passes.bloomPassMain = bloom(
            this.emissivePassMain,
            this.state.unrealBloom.strength,
            this.state.unrealBloom.radius,
            this.state.unrealBloom.threshold,
        );

        this.scenePassMainFinalColor = this.scenePassColorMain.add( this.bloomPassMain )
    }

    _transitionPass() {

        const displacementTexture = this.displacementTexture = this.resources.items.displacementTexture;
        displacementTexture.wrapS = THREE.RepeatWrapping;
        displacementTexture.wrapT = THREE.RepeatWrapping;


        this._calculateUVTransform( displacementTexture );

        this.uResolution = uniform( vec2( this.sizes.width_DPR, this.sizes.height_DPR ) )


        const transitionTexture = Fn( ( params ) => {
            const noiseTexture = params.noiseTexture
            const uResolution = params.uResolution.toVar()
            const aspect = uResolution.x.div( uResolution.y ).toVar()

            let uv = screenUV.div( vec2( 1, aspect ) ).toVar()
            let dist = distance( uv, vec2( 0.5, float( 0.5 ).div( aspect ) ) ).toVar()
            dist = dist.mul( noiseTexture.r )

            return vec4( dist );
        } )

        const transitionPass = this.transitionPass = transition(
            this.scenePassMainFinalColor,
            this.scenePassPreloadFinalColor,
            transitionTexture( {
                uResolution: this.uniforms.uResolution,
                noiseTexture: texture(
                    displacementTexture,
                    uv().mul( this.transitionPassParams.uvScale )
                        .add( this.transitionPassParams.uvOffset )
                        .mul( this.uniforms.transitionPassParams.uvMultiplier )
                ),
            } ),
            //texture(displacementTexture, uv().mul( this.transitionPassParams.uvScale ).add( this.transitionPassParams.uvOffset ).mul( 2 )),
            this.uniforms.transitionPassParams.progress,
            this.uniforms.transitionPassParams.threshold,
            this.uniforms.transitionPassParams.useTexture
        );
    }


    _calculateUVTransform() {
        const { uvScale, uvOffset } = Helpers.calculateUVTransform( this.displacementTexture, this.sizes );

        this.transitionPassParams.uvScale.value.set( uvScale.x, uvScale.y );
        this.transitionPassParams.uvOffset.value.set( uvOffset.x, uvOffset.y );
    }

    startTransitionPreloadToMain() {
        gsap.to( this.uniforms.transitionPassParams.progress, {
            value: 1.0,
            duration: 2,
            ease: 'power1.in',
            onComplete: () => {
                this.composer.outputNode = this.scenePassMainFinalColor
                this.composer.needsUpdate = true
            }
        } )
    }

    resize() {
        //this._calculateUVTransform()
        //this.uniforms.uResolution.value.set( this.sizes.width_DPR, this.sizes.height_DPR )
        // this.composer.setSize( this.sizes.width, this.sizes.height )
        // this.composer.setPixelRatio( this.sizes.pixelRatio )
        //
        // this.bloomComposer?.setSize( this.sizes.width, this.sizes.height )
        // this.bloomComposer?.setPixelRatio( this.sizes.pixelRatio )
    }

    setDebug() {
        if ( !this.debug.active ) return

        if ( this.debug.panel ) {

            const postProcessFolder = this.debug.panel.addFolder( {
                title: 'PostProcess', expanded: false
            } )
            const bloomFolder = postProcessFolder.addFolder( {
                title: 'UnrealBloomPass', expanded: true
            } )

            bloomFolder.addBinding( this.state.unrealBloom, 'enabled', { label: 'Enabled' } ).on( 'change', ( e ) => {
                this.state.unrealBloom.enabled = e.value
                if ( e.value ) {
                    this.passes.bloomPassMain = this.bloomPassMain
                    this.composer.outputNode = this.scenePassColorMain.add( ...Object.values( this.passes ) );
                } else {
                    this.composer.outputNode = this.scenePassColorMain
                    delete this.passes.bloomPassMain
                }

                this.composer.needsUpdate = true
            } )

            bloomFolder.addBinding( this.bloomPassMain.strength, 'value', {
                min: 0, max: 5, step: 0.001, label: 'Strength'
            } )

            bloomFolder.addBinding( this.bloomPassMain.radius, 'value', {
                min: -2, max: 1, step: 0.001, label: 'Radius'
            } )

            bloomFolder.addBinding( this.bloomPassMain.threshold, 'value', {
                min: 0, max: 1, step: 0.001, label: 'Threshold'
            } )

            const transitionsFolder = this.debug.panel.addFolder( {
                title: 'Transitions', expanded: false
            } )

            transitionsFolder.addBinding( this.uniforms.transitionPassParams.progress, 'value', {
                min: 0, max: 1, step: 0.001, label: 'Progress Preload -> Main'
            } )

            transitionsFolder.addButton( {
                title: 'Start',
                label: 'Preload -> Main'
            } ).on( 'click', () => {
                this.startTransitionPreloadToMain()
            } )

            transitionsFolder.addBinding( this.uniforms.transitionPassParams.uvMultiplier, 'value', {
                min: 0.1, max: 10, step: 0.01, label: 'UV Multiplier'
            } )

        }
    }

    productionRender() {
        this.composer.renderAsync()
    }

    debugRender() {
        this.composer.renderAsync()
    }

    update( deltaTime ) {
        if ( this.debug.active ) {
            this.debugRender()
        } else {
            this.productionRender()
        }

    }

}
