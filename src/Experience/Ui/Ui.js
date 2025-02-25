import EventEmitter from '@experience/Utils/EventEmitter.js'
import Experience from '@experience/Experience.js'
import Sizes from '@experience/Utils/Sizes.js'


export default class Ui extends EventEmitter {
    static _instance = null

    static getInstance() {
        return Ui._instance || new Ui()
    }

    experience = Experience.getInstance()
    sizes = Sizes.getInstance()

    constructor() {

        // Singleton
        if ( Ui._instance ) {
            return Ui._instance
        }

        super()

        Ui._instance = this

        this.init()
    }

    init() {
        this.preloader = document.getElementById( "preloader" )
        this.playButton = document.getElementById( "play-button" )
    }

    hardRemovePreloader() {
        this.playButton.classList.replace( "fade-in", "fade-out" );
        this.preloader.classList.add( "preloaded" );
        this.preloader.remove();
        this.playButton.remove();
    }


}
