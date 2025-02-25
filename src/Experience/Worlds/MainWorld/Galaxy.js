import * as THREE from 'three/webgpu'
import * as Helpers from '@experience/Utils/Helpers.js'
import Model from '@experience/Worlds/Abstracts/Model.js'
import Experience from '@experience/Experience.js'
import Debug from '@experience/Utils/Debug.js'
import State from "@experience/State.js";

import {
    sin, positionLocal, time, vec2, vec3, vec4, uv, uniform, color, fog, rangeFogFactor,
    texture, If, min, range, instanceIndex, timerDelta, step, timerGlobal,
    mix, max, uint, cond, varying, varyingProperty, Fn, struct, output, emissive, diffuseColor, PI, PI2,
    oneMinus, cos, atan, float, pass, mrt, assign, normalize, mul, log2, length, pow, smoothstep,
    screenUV, distance, instancedArray, instancedBufferAttribute, attribute, attributeArray, pointUV,
    select, equals
} from 'three/tsl'

import * as tsl from 'three/tsl'


import { fbm3d } from '@experience/TSL/fbm.js'
import { rotateZ, emission, facture } from '@experience/Utils/tsl-utils.js'

export default class Galaxy extends Model {
    experience = Experience.getInstance()
    debug = Debug.getInstance()
    state = State.getInstance()
    sizes = experience.sizes
    input = experience.input

    time = experience.time

    renderer = experience.renderer.instance
    resources = experience.resources
    container = new THREE.Group();


    // Uniforms
    uniforms = {
        uResolution: uniform( new THREE.Vector2( 5, 5 ) ),
        radius: uniform( 1 ),
        speed: uniform( 0.1 ),
        frequency: uniform( 1.4 ),
        distortion: uniform( 0.01 ),
        emissionColor: uniform( new THREE.Color().setRGB( 0.91, 0.55, 0.00) ),
        emissionMultiplier: uniform( 0.4 ),
        size: uniform( 0.02 )
    }

    // Varyings

    varyings = {
        vSwirl: varying( vec4( 0 ), 'vSwirl' )
    }

    constructor( parameters = {} ) {
        super()

        this.world = parameters.world
        this.camera = this.world.camera.instance
        this.scene = this.world.scene

        this.setModel()
        this.setDebug()
    }

    postInit() {

    }

    setModel() {
        this._setTextures()
        this._setPlane()
        this._setParticles()


        this.scene.add( this.container )
    }

    _setTextures() {
        this.swirlTexture = Fn( ( params ) => {
            const _uv = params.uv.mul( 1 )

            const color = vec3( _uv, 0.0 ).toVar();
            color.z.addAssign( 0.5 );
            color.assign( normalize( color ) );
            color.subAssign( mul( this.uniforms.speed, vec3( 0.0, 0.0, time ) ) );
            //color.subAssign( mul( 0.2, vec3( 0.0, 0.0, 0.5 ) ) );

            const angle = float( log2( length( _uv ) ).negate() ).toVar();

            color.assign( rotateZ( color, angle ) );

            const frequency = this.uniforms.frequency;
            const distortion = this.uniforms.distortion;

            color.x.assign( fbm3d( color.mul( frequency ).add( 0.0 ), 5 ).add( distortion ) );
            color.y.assign( fbm3d( color.mul( frequency ).add( 1.0 ), 5 ).add( distortion ) );
            color.z.assign( fbm3d( color.mul( frequency ).add( 2.0 ), 5 ).add( distortion ) );
            const noiseColor = color.toVar(); // save

            noiseColor.mulAssign( 2 );
            noiseColor.subAssign( 0.1 );
            noiseColor.mulAssign( 0.188 );
            //noiseColor.addAssign( vec3(_uv.xy, 0 ) );

            const noiseColorLength = length( noiseColor );
            noiseColorLength.assign( float( 0.770 ).sub( noiseColorLength ) );
            noiseColorLength.mulAssign( 4.2 )
            noiseColorLength.assign( pow( noiseColorLength, 1.0 ) );

            const emissionColor = emission( this.uniforms.emissionColor, noiseColorLength.mul( this.uniforms.emissionMultiplier) );


            const fac = length( _uv ).sub( facture( color.add( 0.32 ) ) );
            fac.addAssign( 0.1 );
            fac.mulAssign( 3.0 );

            color.assign( mix( emissionColor, vec3( fac ), fac.add( 1.2 ) ) );

            //color.assign( mix( color, vec3(0), fac ) )
            //mix(color, vec3(0), fac); // black style

            //const alpha = smoothstep( 0.9, 0.0, color.r.mul( fac ) );
            const alpha = float( 1 ).sub( fac )

            // varying
            this.varyings.vSwirl.assign( color )

            //return vec4( color, alpha );
            return vec4( noiseColor, alpha );
        } )

    }

    _setPlane() {
        const planeGeometry = this.planeGeometry = new THREE.PlaneGeometry(
            this.uniforms.uResolution.value.x,
            this.uniforms.uResolution.value.y,
            512,
            512
        )
        planeGeometry.rotateX( -Math.PI * 0.5 )
        const material = new THREE.MeshBasicNodeMaterial( {
            wireframe: true,
            transparent: true,
        } )

        material.positionNode = Fn( () => {
            const uResolution = this.uniforms.uResolution
            const aspect = uResolution.x.div( uResolution.y )
            const _uv = uv().mul( 2 ).sub( 1 )
            _uv.y.mulAssign( aspect )
            _uv.mulAssign( 1.1 )

            const swirl = this.swirlTexture( { uv: _uv } )

            const finalPosition = positionLocal

            finalPosition.y.addAssign( swirl.g.mul( 0.9 ) )

            return finalPosition
        } )()


        // material.colorNode = Fn( () => {
        //     const uResolution = this.uniforms.uResolution
        //     const aspect = uResolution.x.div( uResolution.y )
        //     const _uv = uv().mul( 2 ).sub( 1 )
        //     _uv.y.mulAssign( aspect )
        //
        //     const color = this.swirlTexture({ uv: _uv })
        //
        //     return color
        // } )()


        this.planeMesh = new THREE.Mesh( planeGeometry, material )

        //this.scene.add( this.planeMesh )

    }

    _setParticles() {

        const positionAttribute = new THREE.InstancedBufferAttribute( new Float32Array( this.planeGeometry.attributes.position.array ), 3 );
        const pos = instancedBufferAttribute( positionAttribute )

        const uvAttribute = new THREE.InstancedBufferAttribute( new Float32Array( this.planeGeometry.attributes.uv.array ), 2 );
        const uvA = instancedBufferAttribute( uvAttribute )


        const particleMaterial = new THREE.SpriteNodeMaterial( { } );


        particleMaterial.positionNode = Fn( () => {

            const uResolution = this.uniforms.uResolution
            const aspect = uResolution.x.div( uResolution.y )

            const _uv = uvA.mul( 2 ).sub( 1 )
            _uv.y.mulAssign( aspect )

            const swirl = this.swirlTexture( { uv: _uv } )

            const finalPosition = pos.toVar()

            finalPosition.y.addAssign( swirl.g )


            If( swirl.a.lessThan( this.uniforms.radius ), () => {
                finalPosition.xyz.assign( vec3( 99999999 ) )
            } )

            return finalPosition
        } )()

        particleMaterial.colorNode = Fn( () => {
            return this.varyings.vSwirl
        } )()

        // particleMaterial.emissiveNode = Fn( () => {
        //     return vec4(0.1)
        // } )()

        // particleMaterial.alphaTestNode = Fn( () => {
        //     return select( equals( vPositionParticle.xyz, vec3( 0 ) ), 1.0, 0.0 );
        // } )()


        particleMaterial.scaleNode = this.uniforms.size
        //particleMaterial.envMapNode = null
        // particleMaterial.depthWrite = false;
        // particleMaterial.depthTest = true;
        // particleMaterial.transparent = true;
        // particleMaterial.blending = THREE.AdditiveBlending;

        const particlesMesh = this.particlesMesh = new THREE.Mesh( new THREE.PlaneGeometry( 1, 1 ), particleMaterial );
        particlesMesh.count = this.planeGeometry.attributes.position.count;
        particlesMesh.frustumCulled = false;


        this.container.add( particlesMesh );
    }

    animationPipeline() {

    }

    resize() {

    }

    setDebug() {
        if ( !this.debug.active ) return

        //this.debug.createDebugTexture( this.resources.items.displacementTexture, this.world )

        const galaxyFolder = this.debug.panel.addFolder( {
            title: 'Galaxy',
        } )

        galaxyFolder.addBinding( this.uniforms.radius, 'value', {
            label: 'Tester',
            min: 1,
            max: 4,
            step: 0.01
        } )

        galaxyFolder.addBinding( this.uniforms.speed, 'value', {
            label: 'Speed',
            min: 0,
            max: 1,
            step: 0.01
        } )

        galaxyFolder.addBinding( this.uniforms.frequency, 'value', {
            label: 'Frequency',
            min: 0,
            max: 5,
            step: 0.01
        } )

        galaxyFolder.addBinding( this.uniforms.distortion, 'value', {
            label: 'Distortion',
            min: 0,
            max: 0.1,
            step: 0.001
        } )

        galaxyFolder.addBinding( this.uniforms.emissionColor, 'value', {
            label: 'Emission Color',
            color: { type: 'float' }
        } )

        galaxyFolder.addBinding( this.uniforms.emissionMultiplier, 'value', {
            label: 'Emission Multiplier',
            min: 0,
            max: 1,
            step: 0.01
        } )

    }

    update( deltaTime ) {

    }

}
