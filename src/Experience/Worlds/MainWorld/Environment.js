import * as THREE from 'three/webgpu'
import Experience from '@experience/Experience.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export default class Environment {
    constructor( parameters = {} ) {
        this.experience = new Experience()
        this.scene = parameters.world.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.renderer = this.experience.renderer.instance

        this.scene.colorSpace = THREE.SRGBColorSpace

        this.uniforms = {
            topColor: new THREE.Color().setRGB( 0.25, 0.25, 0.25 ),
            bottomColor: new THREE.Color().setRGB( 0.12, 0.13, 0.17 )
        }

        this.setAmbientLight()
        this.setDirectionalLight()
        //this.setEnvironmentMap()
        this.setHDRI()


        this.setDebug()
    }

    setAmbientLight() {
        this.ambientLight = new THREE.AmbientLight( '#ffffff', 0.05 )
        this.scene.add( this.ambientLight )
    }

    setDirectionalLight() {
        this.directionalLight = new THREE.DirectionalLight( '#ffffff', 1 )
        this.directionalLight.position.set( 0, 5, 5 )
        this.scene.add( this.directionalLight )
    }

    setEnvironmentMap() {
        const environment = new RoomEnvironment( this.renderer );
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );

        pmremGenerator.fromSceneAsync( environment ).then( ( envMap ) => {

            const env = envMap.texture;

            this.scene.background = env;
            this.scene.environment = env;
            this.scene.backgroundBlurriness = 0.5;

            // Free memory
            pmremGenerator.dispose();
        } ).catch( ( error ) => {
            console.error( "Error Generating environment:", error );
        } );


        // //environment.dispose();

        // //set background transparent
        // this.scene.background = null;

    }


    createGradientTexture( topColor, bottomColor ) {
        const canvas = document.createElement( 'canvas' );
        const ctx = canvas.getContext( '2d' );

        canvas.width = 10;
        canvas.height = 10;

        const gradient = ctx.createLinearGradient( 0, 0, 0, canvas.height );
        gradient.addColorStop( 0, '#' + topColor.getHexString() ); // top color
        gradient.addColorStop( 1, '#' + bottomColor.getHexString() ); // bottom color

        ctx.fillStyle = gradient;
        ctx.fillRect( 0, 0, canvas.width, canvas.height );

        return new THREE.CanvasTexture( canvas );
    }

    setHDRI() {
        const hdriTexture = this.resources.items.hdriTexture

        // set EquiRectangular projection
        hdriTexture.mapping = THREE.EquirectangularReflectionMapping

        this.scene.environment = hdriTexture
        // this.scene.background = this.resources.items.gradientTexture
        // this.scene.backgroundBlurriness = 0.2

        // set scene background gradient
        this.scene.background = this.createGradientTexture( this.uniforms.topColor, this.uniforms.bottomColor )
    }

    setDebug() {
        if ( this.debug.active ) {
            const environmentFolder = this.debug.panel.addFolder( {
                title: 'Environment',
                expanded: true,
            } )

            environmentFolder.addBinding( this.uniforms, 'topColor', {
                label: 'Top Color',
                color: { type: 'float' }
            } ).on( 'change', ( e ) => {
                this.scene.background = this.createGradientTexture( this.uniforms.topColor, this.uniforms.bottomColor )
            } )

            environmentFolder.addBinding( this.uniforms, 'bottomColor', {
                label: 'Bottom Color',
                color: { type: 'float' }
            } ).on( 'change', ( e ) => {
                this.scene.background = this.createGradientTexture( this.uniforms.topColor, this.uniforms.bottomColor )
            } )
        }
    }
}
