import * as THREE from 'three/webgpu'
import Experience from '@experience/Experience.js'
import Resources from "@experience/Utils/Resources.js";

export default class Model {

    constructor() {

    }

    // loadModel( inputElement ) {
    //
    //     if ( this[this.sources[0].name] || this.loadingModel ) {
    //         return;
    //     }
    //
    //     this.loadingModel = true;
    //
    //     const preloaderElement = document.createElement( 'div' )
    //     preloaderElement.classList.add( 'loader' )
    //     inputElement.parentElement.appendChild( preloaderElement )
    //
    //     this.localResources = new Resources( this.sources, this.sourcesReady )
    //
    //     this.localResources.on( this.sourcesReady, () => {
    //         this.setModel()
    //         this.setDebug()
    //         inputElement.parentElement.removeChild( preloaderElement )
    //         this.loadingModel = false;
    //     } )
    // }

    setModel() {
    }

    setDebug() {

    }
}
