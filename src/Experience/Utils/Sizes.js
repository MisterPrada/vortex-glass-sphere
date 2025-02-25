import EventEmitter from './EventEmitter.js'

export default class Sizes extends EventEmitter {

    static _instance = null

    static getInstance() {
        return Sizes._instance || new Sizes()
    }

    constructor() {
        // Singleton
        if ( Sizes._instance ) {
            return Sizes._instance
        }

        super()

        Sizes._instance = this

        // Setup
        this.pixelRatio = Math.min( window.devicePixelRatio, 2 )
        this.width = window.innerWidth
        this.height = window.innerHeight

        this.width_DPR = this.width * window.devicePixelRatio
        this.height_DPR = this.height * window.devicePixelRatio

        // Resize event
        window.addEventListener( 'resize', () => {
            this.pixelRatio = Math.min( window.devicePixelRatio, 2 )
            this.width = window.innerWidth
            this.height = window.innerHeight

            this.width_DPR = this.width * window.devicePixelRatio
            this.height_DPR = this.height * window.devicePixelRatio

            this.trigger( 'resize' )
        } )
    }

}
