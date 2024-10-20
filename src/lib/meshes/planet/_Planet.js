// @ts-nocheck
import * as THREE from 'three';
import vsDecl from './shaderChunks/vsDecl.glsl?raw';
import vsMainStart from './shaderChunks/vsMainStart.glsl?raw';
import fsDecl from './shaderChunks/fsDecl.glsl?raw';
import fsBeforeMain from './shaderChunks/fsBeforeMain.glsl?raw';
import fsMainEnd from './shaderChunks/fsMainEnd.glsl?raw';

export class _Planet {
	constructor(radius = 1, detail = 5, rotationSpeed = 0.1, rotationAxis) {
		this.clock = new THREE.Clock();
		this.rotationSpeed = rotationSpeed;
		this.rotationAxis = rotationAxis || new THREE.Vector3(0, 1, 0);
		this.geometry = new THREE.IcosahedronGeometry(radius, detail);
		this.material = new THREE.MeshPhongMaterial({ color: 0xb9bcbf });
		this.needsUpdate = false;
		// inject custom shaders
		this.material.onBeforeCompile = (shader) => {
			shader.uniforms.uTime = { value: this.clock.getElapsedTime() };
			shader.uniforms.uSpeed = { value: this.rotationSpeed };
			shader.uniforms.uAxis = { value: this.rotationAxis };
			shader.vertexShader = shader.vertexShader.replace(
				'#include <common>',
				`
                #include <common>
                ${vsDecl}
                `
			);
			shader.vertexShader = shader.vertexShader.replace(
				'#include <fog_vertex>',
				`
                #include <fog_vertex>
                ${vsMainStart}
                `
			);
			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <common>',
				`
                #include <common>
                ${fsDecl}
                `
			);
			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <clipping_planes_pars_fragment>',
				`
                #include <clipping_planes_pars_fragment>
                ${fsBeforeMain}
                `
			);
			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <dithering_fragment>',
				`
                #include <dithering_fragment>
                ${fsMainEnd}
                `
			);
			// put shader into userData for the later reference
			this.material.userData.shader = shader;
		};
		this.mesh = new THREE.Mesh(this.geometry, this.material);

		return this;
	}

	resetClock() {
		this.clock.stop();
		this.clock.start();
	}

	update() {
		const shader = this.material.userData.shader;
		// update uniforms
		if (shader) {
			shader.uniforms.uTime.value = this.clock.getElapsedTime();
			if (this.needsUpdate) {
				shader.uniforms.uSpeed.value = this.rotationSpeed;
				shader.uniforms.uAxis.value = this.rotationAxis;
				this.needsUpdate = false;
			}
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
