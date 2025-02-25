import * as THREE from 'three/webgpu'
import Experience from '@experience/Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from "gsap";

import { TransformControls } from 'three/addons/controls/TransformControls.js';

export default class Camera {
    constructor( parameters = {} ) {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.time = this.experience.time
        this.canvas = this.experience.canvas
        this.timeline = this.experience.timeline
        this.renderer = this.experience.renderer.instance
        this.cursorEnabled = false


        this.lerpVector = new THREE.Vector3();

        this.setInstance()
        this.setControls()
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera( 25, this.sizes.width / this.sizes.height, 0.1, 300 )
        this.defaultCameraPosition = new THREE.Vector3( 0, 4.5, 12 );

        this.instance.position.copy( this.defaultCameraPosition )
        this.instance.lookAt( new THREE.Vector3( 0, 0, 0 ) );

        this.lerpVector.copy( this.instance.position );
    }

    setControls() {
        this.controls = new OrbitControls( this.instance, this.canvas )
        this.controls.enableDamping = true
        this.controls.minDistance = 0;
        this.controls.maxDistance = 500;
        this.controls.enabled = true;
        this.controls.target = new THREE.Vector3( 0, 0, 0 );


        // this.controls.mouseButtons = {
        //     LEFT: THREE.MOUSE.ROTATE,
        //     MIDDLE: null,
        //     RIGHT: null,  // Отключает действие для правой кнопки мыши
        // };
        //
        // this.controls.enableZoom = false;


        this.transformControls = new TransformControls( this.instance, this.renderer.domElement );
        //this.transformControls.addEventListener( 'change', render );
        this.transformControls.addEventListener( 'dragging-changed', ( event ) => {
            this.controls.enabled = ! event.value;
        } );



        this.setListeners()
    }

    setListeners() {
        const control = this.transformControls;
        window.addEventListener( 'keydown', ( event ) => {

            switch ( event.key ) {

                case 'q':
                    control.setSpace( control.space === 'local' ? 'world' : 'local' );
                    break;

                case 'Shift':
                    control.setTranslationSnap( 1 );
                    control.setRotationSnap( THREE.MathUtils.degToRad( 15 ) );
                    control.setScaleSnap( 0.25 );
                    break;

                case 'w':
                    control.setMode( 'translate' );
                    break;

                case 'e':
                    control.setMode( 'rotate' );
                    break;

                case 'r':
                    control.setMode( 'scale' );
                    break;

                case '+':
                case '=':
                    control.setSize( control.size + 0.1 );
                    break;

                case '-':
                case '_':
                    control.setSize( Math.max( control.size - 0.1, 0.1 ) );
                    break;

                case 'x':
                    control.showX = ! control.showX;
                    break;

                case 'y':
                    control.showY = ! control.showY;
                    break;

                case 'z':
                    control.showZ = ! control.showZ;
                    break;

                case ' ':
                    control.enabled = ! control.enabled;
                    break;

                case 'Escape':
                    control.reset();
                    break;

            }

        } );

        window.addEventListener( 'keyup', function ( event ) {

            switch ( event.key ) {

                case 'Shift':
                    control.setTranslationSnap( null );
                    control.setRotationSnap( null );
                    control.setScaleSnap( null );
                    break;

            }

        } );
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update() {
        this.controls.update()

        //this.instance.updateMatrixWorld() // To be used in projection
    }

    animateCameraPosition() {

    }
}
