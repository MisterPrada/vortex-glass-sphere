import * as THREE from 'three/webgpu'
import EventEmitter from './EventEmitter.js'
import Experience from '@experience/Experience.js'
import Debug from './Debug.js'
import Sizes from './Sizes.js'

export default class Sound extends EventEmitter
{
    constructor()
    {
        super()

        this.experience = Experience.getInstance()
        //this.camera = this.experience.camera.instance
        this.resources = this.experience.resources
        this.renderer = this.experience.renderer.instance
        this.debug = Debug.getInstance()
        this.sizes = Sizes.getInstance()

        this.soundsCreated = false;

    }

    isTabVisible() {
        return document.visibilityState === "visible";
    }

    handleVisibilityChange() {
        if (this.isTabVisible()) {
            this.backgroundSound.play();
            this.listener.setMasterVolume(1)
        } else {
            this.backgroundSound.pause();
            this.listener.setMasterVolume(0)
        }
    }

    createSounds() {
        if ( this.soundsCreated === true )
            return

        this.listener = new THREE.AudioListener();
        this.camera.add( this.listener );

        this.backgroundSound = new THREE.Audio( this.listener );
        this.backgroundSound.setBuffer( this.resources.items.backgroundSound );
        this.backgroundSound.setLoop( true );
        this.backgroundSound.setVolume( 0.8 );
        this.backgroundSound.play();


        this.soundsCreated = true;

        document.addEventListener('visibilitychange', () => this.handleVisibilityChange(), false);

        // window.addEventListener('blur', () => this.backgroundSound.pause());
        // window.addEventListener('focus', () => {
        //     if (isTabVisible()) {
        //         this.backgroundSound.play();
        //     }
        // });

    }

    update() {

    }

    resize() {

    }

}
