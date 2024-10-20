// @ts-nocheck
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
// Post-effects
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const defaultParams = {
	threshold: 0.1,
	strength: 0.8,
	radius: 0.2
};

const vertexShader = `
varying vec2 vUv;
void main() {

    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

const fragmentShader = `
uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;

varying vec2 vUv;

void main() {
    // final_color = original_texture + intensity * bloom_texture
    gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );

}
`;

export class SelectiveBloom {
	/**
	 * Add blooming post effect
	 * @param {*} renderer renderer
	 * @param {*} scene scene
	 * @param {*} camera camera
	 * @param {Integer} bloomScene the blooming layer
	 * @returns this
	 */
	constructor(renderer, scene, camera, bloomScene = 1) {
		this._darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
		this._renderer = renderer;
		this._scene = scene;
		this._camera = camera;

		this.bloomScene = bloomScene;
		this.bloomLayer = new THREE.Layers();
		this.bloomLayer.set(this.bloomScene);

		this._materials = {};

		this._renderScene = new RenderPass(scene, camera);
		this._bloomPass = this._createBloomPass();
		this.bloomComposer = this._createBloomComposer();
		this._mixPass = this._createMixPass();
		// this._outlinePass = this._createOutlinePass();
		this.finalComposer = this._createFinalComposer();

		// this._selectObjects = [];

		return this;
	}

	_createBloomPass() {
		const bloomPass = new UnrealBloomPass(
			new THREE.Vector2(window.innerWidth, window.innerHeight),
			defaultParams.strength,
			defaultParams.radius,
			defaultParams.threshold
		);
		return bloomPass;
	}

	_createBloomComposer() {
		let bloomComposer = new EffectComposer(this._renderer);
		bloomComposer.renderToScreen = false;
		bloomComposer.addPass(this._renderScene);
		bloomComposer.addPass(this._bloomPass);
		return bloomComposer;
	}

	_createMixPass() {
		const mixPass = new ShaderPass(
			new THREE.ShaderMaterial({
				uniforms: {
					baseTexture: { value: null },
					bloomTexture: { value: this.bloomComposer.renderTarget2.texture }
				},
				vertexShader,
				fragmentShader,
				defines: {}
			}),
			'baseTexture'
		);
		mixPass.needsSwap = true;
		return mixPass;
	}

	// _createOutlinePass() {
	// 	const outlinePass = new OutlinePass(
	// 		new THREE.Vector2(window.innerWidth, window.innerHeight),
	// 		this._scene,
	// 		this._camera
	// 	);
	// 	outlinePass.edgeStrength = 3.0;
	// 	outlinePass.edgeGlow = 0.0;
	// 	outlinePass.edgeThickness = 1.0;
	// 	outlinePass.visibleEdgeColor.set('#ffffff');

	// 	return outlinePass;
	// }

	_createFinalComposer() {
		let finalComposer = new EffectComposer(this._renderer);
		finalComposer.addPass(this._renderScene);

		// mix pass
		finalComposer.addPass(this._mixPass);

		// outline pass
		// finalComposer.addPass(this._outlinePass);

		// output pass
		const outputPass = new OutputPass();
		finalComposer.addPass(outputPass);
		return finalComposer;
	}

	_darkenNonBloomed(obj) {
		if (
			(obj.isMesh || obj.isPoints) &&
			obj.material &&
			this.bloomLayer.test(obj.layers) === false
		) {
			this._materials[obj.uuid] = obj.material;
			if (obj.isInstancedLabelSprites) {
				obj.visible = false;
			} else {
				obj.material = this._darkMaterial;
			}
		}
	}
	_restoreMaterial(obj) {
		if (this._materials[obj.uuid]) {
			if (obj.isInstancedLabelSprites) {
				obj.visible = true;
			} else {
				obj.material = this._materials[obj.uuid];
			}
			delete this._materials[obj.uuid];
		}
	}

	// /**
	//  * Add new object to this post effect
	//  * @param {THREE.Object3D} obj
	//  */
	// addOutline(obj) {
	// 	this._selectedObjects = [];
	// 	this._selectedObjects.push(obj);
	// 	this._outlinePass.selectedObjects = this._selectedObjects;
	// }

	// /**
	//  * Remove objects from this post effect
	//  */
	// removeOutline() {
	// 	this._selectedObjects = [];
	// 	this._outlinePass.selectedObjects = this._selectedObjects;
	// }

	/**
	 * Add new object to this post effect
	 * @param {THREE.Object3D} obj
	 */
	add(obj) {
		obj.traverse((o) => {
			if ((o.isMesh || o.isPoints) && o.material) {
				o.layers.enable(this.bloomScene);
			}
		});
	}

	/**
	 * Remove object from this post effect
	 * @param {THREE.Object3D} obj
	 */
	remove(obj) {
		obj.traverse((o) => {
			if ((o.isMesh || o.isPoints) && o.material) {
				o.layers.disable(this.bloomScene);
			}
		});
	}

	/**
	 * Set Pass params
	 * @param {{threshold: number, strength: number, radius: number}} params
	 */
	setPassParams(params) {
		if (typeof params.threshold === 'number') this._bloomPass.threshold = params.threshold;
		if (typeof params.strength === 'number') this._bloomPass.strength = params.strength;
		if (typeof params.radius === 'number') this._bloomPass.radius = params.radius;
	}

	/**
	 * Get current Pass params
	 * @returns {{threshold: number, strength: number, radius: number}}
	 */
	getPassParams() {
		return {
			threshold: this._bloomPass.threshold,
			strength: this._bloomPass.strength,
			radius: this._bloomPass.radius,
		}
	}

	/**
	 * Use this render function to activate the effect
	 */
	render() {
		let background = this._scene.background;
		// traverse objects and replace non-bloomed's materials or hide them completely
		this._scene.traverseVisible(this._darkenNonBloomed.bind(this));
		this._scene.background.set(0x000000);
		// render scene for the first time
		this.bloomComposer.render();

		this._scene.background.set(background);
		// traverse objects and restore non-bloomed's materials or unhide them
		this._scene.traverse(this._restoreMaterial.bind(this));
		// final render
		this.finalComposer.render();
	}

	setSize(width, height) {
		this.bloomComposer.setSize(width, height);
		this.finalComposer.setSize(width, height);
	}
}
