// @ts-nocheck
import * as THREE from 'three';
import vertexShader from './shaders/vertex.glsl?raw';
import fragmentShader from './shaders/fragment.glsl?raw';

export class _Star {
	constructor(
		radius = 1,
		detail = 5,
		speed = 1,
		color = new THREE.Vector3(1, 1, 1),
		addLight = false
	) {
		this.clock = new THREE.Clock();
		this.speed = speed;
		// TODO: age * mass -> temperature -> color
		this.color = color;
		// differential rotation constants: https://en.wikipedia.org/wiki/Solar_rotation
		this.diffRotationCA = 14.713; // constant A
		this.diffRotationCB = -2.396; // constant B
		this.diffRotationCC = -1.787; // constant C
		this.geometry = new THREE.IcosahedronGeometry(radius, detail);
		this.material = new THREE.ShaderMaterial({
			uniforms: {
				uColor: { value: this.color },
				uTime: { value: this.clock.getElapsedTime() },
				uSpeed: { value: this.speed },
				uDiffRotationCA: { value: this.diffRotationCA },
				uDiffRotationCB: { value: this.diffRotationCB },
				uDiffRotationCC: { value: this.diffRotationCC }
			},
			vertexShader,
			fragmentShader
		});
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.castShadow = false;
		this.mesh.receiveShadow = false;
		this.needsUpdate = false;
		// add lighting
		if (addLight) {
			const pointLight = new THREE.PointLight(this.color, 20, 10);
			pointLight.position.copy(this.mesh.position);
			this.light = pointLight;
			this.mesh.add(pointLight);
		}

		return this;
	}

	resetClock() {
		this.clock.stop();
		this.clock.start();
	}

	update() {
		this.material.uniforms.uTime.value = this.clock.getElapsedTime();
		// needsUpdate
		if (this.needsUpdate) {
			this.material.uniforms.uColor.value = this.color;
			this.material.uniforms.uSpeed.value = this.speed;
			this.material.uniforms.uDiffRotationCA.value = this.diffRotationCA;
			this.material.uniforms.uDiffRotationCB.value = this.diffRotationCB;
			this.material.uniforms.uDiffRotationCC.value = this.diffRotationCC;
			if (this.light) this.light.color = this.color;
			this.needsUpdate = false;
		}
	}

	/**
	 * Deletes this from scene
	 */
	dispose() {
		this.clock.stop();

		const geometry = this.mesh.geometry;
		const material = this.mesh.material;

		geometry.dispose();
		material.dispose();
	}
}
