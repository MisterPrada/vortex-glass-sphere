import EventEmitter from './EventEmitter.js'
import gsap from "gsap";

export default class Time extends EventEmitter {
    static _instance = null

    static getInstance() {
        return Time._instance || new Time()
    }

    constructor() {
        if ( Time._instance ) {
            return Time._instance
        }

        super()

        Time._instance = this

        // Setup
        this.start = Date.now()
        this.current = this.start
        this.playing = true
        this.elapsed = 0
        this.delta = 0.016666666666666668
        this.deltaSim = 0.016666666666666668
        this.timeline = gsap.timeline( {
            paused: true,
        } );

        window.requestAnimationFrame( () => {
            this.tick()
        } )
    }

    tick() {
        const currentTime = Date.now()
        this.delta = (currentTime - this.current ) * 0.001
        this.deltaSim = Math.min( ( currentTime - this.current ) * 0.001, 0.016 )
        this.current = currentTime
        this.elapsed = ( this.current - this.start ) * 0.001

        if ( this.deltaSim > 0.06 ) {
            this.deltaSim = 0.06
        }

        this.timeline.time( this.elapsed );

        this.trigger( 'tick' )

        window.requestAnimationFrame( () => {
            this.tick()
        } )
    }

    reset() {
        this.start = Date.now()
        this.current = this.start
        this.elapsed = 0
    }
}
