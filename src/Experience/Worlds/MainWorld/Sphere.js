import * as THREE from 'three/webgpu'
import * as Helpers from '@experience/Utils/Helpers.js'
import Model from '@experience/Worlds/Abstracts/Model.js'
import Experience from '@experience/Experience.js'
import Debug from '@experience/Utils/Debug.js'
import State from "@experience/State.js";

import {
    sin, positionLocal, time, vec2, vec3, vec4, uv, uniform, color, fog, rangeFogFactor,
    texture, If, min, range, instanceIndex, timerDelta, step, timerGlobal,
    mix, max, uint, cond, varying, Fn, struct, output, emissive, diffuseColor, PI, PI2,
    oneMinus, cos, atan, float, pass, mrt
} from 'three/tsl'

export default class Sphere extends Model {
    experience = Experience.getInstance()
    debug = Debug.getInstance()
    state = State.getInstance()
    input = experience.input

    time = experience.time

    renderer = experience.renderer.instance
    resources = experience.resources
    container = new THREE.Group();

    uniforms = {
        color: uniform( new THREE.Color( 0xffffff ) ),
        metalness: uniform( 0.0 ),
        roughness: uniform( 0 ),
        ior: uniform( 1.5 ),
        thickness: uniform( 0.3 ),
        clearcoat: uniform( 0.73 ),
        dispersion: uniform( 5.0 ),
        attenuationColor: uniform( new THREE.Color( 0xffffff ) ),
        attenuationDistance: uniform( 1 ),
        //alphaMap: texture,
        //envMap: hdrEquirect,
        envMapIntensity: uniform( 1 ),
        transmission: uniform( 1 ),
        specularIntensity: uniform( 1 ),
        specularColor: uniform( new THREE.Color( 0xffffff ) ),
        opacity: uniform( 1 ),
        side: THREE.DoubleSide,
        transparent: true
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

        // Create Glass Sphere
        const sphereGeometry = new THREE.SphereGeometry( 2.3, 32, 32 )
        const sphereMaterial = this.sphereMaterial = new THREE.MeshPhysicalNodeMaterial( {
            color: this.uniforms.color.value,
            metalness: this.uniforms.metalness.value,
            roughness: this.uniforms.roughness.value,
            ior: this.uniforms.ior.value,
            dispersion: this.uniforms.dispersion.value,
            thickness: this.uniforms.thickness.value,
            clearcoat: this.uniforms.clearcoat.value,
            //alphaMap: texture,
            //envMap: hdrEquirect,
            envMapIntensity: this.uniforms.envMapIntensity.value,
            transmission: this.uniforms.transmission.value,
            specularIntensity: this.uniforms.specularIntensity.value,
            specularColor: this.uniforms.specularColor.value,
            opacity: this.uniforms.opacity.value,
            side: THREE.DoubleSide,
            transparent: false,
        })


        const sphereMesh = new THREE.Mesh( sphereGeometry, sphereMaterial )

        this.container.add( sphereMesh )

        this.scene.add( this.container )
    }

    animationPipeline() {

    }

    resize() {

    }

    setDebug() {
        if ( !this.debug.active ) return

        //this.debug.createDebugTexture( this.resources.items.displacementTexture, this.world )

        const sphereFolder = this.debug.panel.addFolder({
            title: 'Sphere',
            expanded: false,
        })

        sphereFolder.addBinding( this.uniforms.color, 'value', {
            label: 'Color',
            color: { type: 'float' }
        } ).on( 'change', ( e ) => {
            this.sphereMaterial.color = this.uniforms.color.value
        } )

        sphereFolder.addBinding( this.uniforms.metalness, 'value', {
            label: 'Metalness',
            min: 0,
            max: 1
        } ).on( 'change', ( e ) => {
            this.sphereMaterial.metalness = this.uniforms.metalness.value
        } )

        sphereFolder.addBinding( this.uniforms.roughness, 'value', {
            label: 'Roughness',
            min: 0,
            max: 1
        } ).on( 'change', ( e ) => {
            this.sphereMaterial.roughness = this.uniforms.roughness.value
        } )

        sphereFolder.addBinding( this.uniforms.ior, 'value', {
            label: 'IOR',
            min: 1,
            max: 5
        } ).on( 'change', ( e ) => {
            this.sphereMaterial.ior = this.uniforms.ior.value
        } )

        sphereFolder.addBinding( this.uniforms.transmission, 'value', {
            label: 'Transmission',
            min: 0,
            max: 1
        } ).on( 'change', ( e ) => {
            this.sphereMaterial.transmission = this.uniforms.transmission.value
        } )

        sphereFolder.addBinding( this.uniforms.specularIntensity, 'value', {
            label: 'Specular Intensity',
            min: 0,
            max: 1
        } ).on( 'change', ( e ) => {
            this.sphereMaterial.specularIntensity = this.uniforms.specularIntensity.value
        } )

        sphereFolder.addBinding( this.uniforms.specularColor, 'value', {
            label: 'Specular Color',
            color: { type: 'float' }
        } ).on( 'change', ( e ) => {
            this.sphereMaterial.specularColor = this.uniforms.specularColor.value
        } )

        sphereFolder.addBinding( this.uniforms.opacity, 'value', {
            label: 'Opacity',
            min: 0,
            max: 1
        } ).on( 'change', ( e ) => {
            this.sphereMaterial.opacity = this.uniforms.opacity.value
        } )

        sphereFolder.addBinding( this.uniforms.envMapIntensity, 'value', {
            label: 'EnvMap Intensity',
            min: 0,
            max: 1
        } ).on( 'change', ( e ) => {
            this.sphereMaterial.envMapIntensity = this.uniforms.envMapIntensity.value
        } )

        sphereFolder.addBinding( this.uniforms.dispersion, 'value', {
            label: 'Dispersion',
            min: 0,
            max: 5
        } ).on( 'change', ( e ) => {
            this.sphereMaterial.dispersion = this.uniforms.dispersion.value
        } )

        sphereFolder.addBinding( this.uniforms.attenuationColor, 'value', {
            label: 'Attenuation Color',
            color: { type: 'float' }
        } ).on( 'change', ( e ) => {
            this.sphereMaterial.attenuationColor = this.uniforms.attenuationColor.value
        } )

        sphereFolder.addBinding( this.uniforms.attenuationDistance, 'value', {
            label: 'Attenuation Distance',
            min: 0,
            max: 1
        } ).on( 'change', ( e ) => {
            this.sphereMaterial.attenuationDistance = this.uniforms.attenuationDistance.value
        } )

        sphereFolder.addBinding( this.uniforms.thickness, 'value', {
            label: 'Thickness',
            min: 0,
            max: 1
        } ).on( 'change', ( e ) => {
            this.sphereMaterial.thickness = this.uniforms.thickness.value
        } )

        sphereFolder.addBinding( this.uniforms.clearcoat, 'value', {
            label: 'Clearcoat',
            min: 0,
            max: 1
        } ).on( 'change', ( e ) => {
            this.sphereMaterial.clearcoat = this.uniforms.clearcoat.value
        } )

    }

    update( deltaTime ) {

    }

}
