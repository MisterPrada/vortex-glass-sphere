import * as THREE from 'three/webgpu'
import Model from '@experience/World/Abstracts/Model.js'
import Experience from '@experience/Experience.js'
import Debug from '@experience/Utils/Debug.js'
import State from "@experience/State.js";
import FBO from "@experience/Utils/FBO.js";

export default class SceneDepth extends Model {
	experience = Experience.getInstance()
	debug = Debug.getInstance()
	state = State.getInstance()
	fbo = FBO.getInstance()
	sizes = experience.sizes
	scene = experience.scene
	time = experience.time
	camera = experience.camera.instance
	renderer = experience.renderer.instance
	resources = experience.resources
	postProcess = this.experience.postProcess
	container = new THREE.Group();

	constructor() {
		super()

		this.setScene()
		this.setDebug()
	}

	setScene() {
		this.sceneDepth = new THREE.Scene()

		this.sceneDepth.add( this.container )
		this.setDepthBuffer()
	}

	setDepthBuffer() {
		const dpr = this.renderer.getPixelRatio();
		const depthRenderTarget = this.fbo.createRenderTarget( this.sizes.width * this.sizes.pixelRatio, this.sizes.height * this.sizes.pixelRatio, false, false, 0 );

		depthRenderTarget.depthTexture = new THREE.DepthTexture();
		depthRenderTarget.depthTexture.format = THREE.DepthFormat;
		depthRenderTarget.depthTexture.type = THREE.UnsignedShortType;

		this.depthRenderTarget = depthRenderTarget;
	}

	resize() {
		this.depthRenderTarget.setSize( this.sizes.width * this.sizes.pixelRatio, this.sizes.height * this.sizes.pixelRatio )
		this.depthRenderTarget.depthTexture.image.width = this.sizes.width * this.sizes.pixelRatio
		this.depthRenderTarget.depthTexture.image.height = this.sizes.height * this.sizes.pixelRatio

		this.postUpdate( this.time.delta ) // fix flickering background objects
	}
	setDebug() {
		if ( !this.debug.active ) return

		this.debug.createDebugTexture( this.depthRenderTarget.texture )
	}


	postUpdate( deltaTime ) {

		this.renderer.autoClear = true
		this.renderer.setRenderTarget( this.depthRenderTarget );
		this.renderer.render( this.sceneDepth, this.camera )
		this.renderer.setRenderTarget( null );

		this.postProcess.clearPass.uniforms.u_DepthTexture.value = this.depthRenderTarget.texture;
		// this.postProcess.clearPass.uniforms.cameraNear.value = this.camera.near;
		// this.postProcess.clearPass.uniforms.cameraFar.value = this.camera.far;

		//this.renderer.render( this.sceneDepth, this.camera );
	}

}
