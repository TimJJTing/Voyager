// @ts-nocheck
import * as THREE from 'three';

export class Particles {
	/**
	 * Particles
	 * @param {number[]} positions positions of particles, size = #particles * 3
	 * @param {number[]} colors colors of particles
	 * @param {number[]} group group of particles
	 * @param {{size: number, sizeAttenuation: boolean, vertexColors: boolean}|undefined} params material parameters
	 * @returns this
	 */
	constructor(positions, colors, groups, params = undefined) {
		this._animation = undefined;
		this._needsUpdatePositions = false;
		this._needsUpdateVisibilities = false;
		this.focusGroup = undefined;
		this.geometry = new THREE.BufferGeometry();
		this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		this.geometry.setAttribute('group', new THREE.Int32BufferAttribute(groups, 1));
		// this.geometry.setAttribute('group', new THREE.Int16BufferAttribute(groups, 1));
		this.visibilities = this._createVisibilities();
		this.geometry.setAttribute(
			'visibility',
			new THREE.Float32BufferAttribute(this.visibilities, 1)
		);
		this.material = new THREE.PointsMaterial({
			transparent: true,
			size: params?.size || 1,
			sizeAttenuation: params?.sizeAttenuation || false,
			vertexColors: params?.vertexColors || true
		});
		// apply opacity to each vertex
		this.material.onBeforeCompile = (shader) => {
			shader.vertexShader = shader.vertexShader.replace(
				'#include <common>',
				`
                #include <common>
                attribute float visibility;
				varying float vVisibility;
                `
			);
			shader.vertexShader = shader.vertexShader.replace(
				'#include <fog_vertex>',
				`
                #include <fog_vertex>
                vVisibility = visibility;
                `
			);

			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <common>',
				`
				varying float vVisibility;
                #include <common>
                `
			);
			// modify fragment visibility if the particle is in low visibility
			shader.fragmentShader = shader.fragmentShader.replace(
				'void main() {',
				`
				void main() {
				if (vVisibility < 1.0) {
				  gl_FragColor = vec4(vec3(0.196,0.196,0.216), vVisibility);
				  return;
				}
                `
			);
		};
		this.mesh = new THREE.Points(this.geometry, this.material);
		return this;
	}

	_createVisibilities() {
		let visibilities = [];
		for (let i = 0; i < this.geometry.getAttribute('position').count; i++) {
			visibilities.push(1);
		}
		return visibilities;
	}

	/**
	 * @return {THREE.BufferAttribute} p
	 */
	get positions() {
		return this.geometry.getAttribute('position');
	}
	/**
	 * @return {THREE.BufferAttribute} p
	 */
	get colors() {
		return this.geometry.getAttribute('color');
	}

	/**
	 * set visibility to every point
	 * @param {boolean} v
	 */
	set visible(v) {
		this.mesh.visible = v;
	}

	/**
	 * update particle visibilities
	 */
	updateVisibilities() {
		for (let i = 0; i < this.geometry.getAttribute('position').count; i++) {
			let groupVisibility =
				this.focusGroup === undefined ||
				this.focusGroup === this.geometry.getAttribute('group').getX(i)
					? 1
					: 0.1;
			let filterVisibility = this.visibilities[i] || 0.1;
			this.mesh.geometry.attributes.visibility.setX(
				i,
				Math.min(groupVisibility, filterVisibility)
			);
		}
		this._needsUpdateVisibilities = true;
	}
	/**
	 * @param {THREE.Vector3} p
	 */
	lookAt(p) {
		this.mesh.lookAt(p);
	}
	/**
	 * Return the Particle Mesh
	 */
	getMesh() {
		return this.mesh;
	}

	/**
	 * @param {number[]} nps new positions of particles, size = #particles * 3
	 * @param {boolean} animate animate the transition with linear interpolation
	 * @param {number} frames number of interpolated frames between the old and the new. The greater the smoother. Only affects when `animate = true`
	 */
	updatePositions(nps, animate = false, frames = 500) {
		const ops = this.positions.array;
		if (ops.length !== nps.length) {
			throw new Error('Arrays must have the same length');
		}
		if (animate) {
			// create an animation object so that the next update can use
			this._animation = {
				ops,
				nps,
				frame: 1,
				totalFrames: frames
			};
		} else {
			this.mesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(nps, 3));
		}
		this._needsUpdatePositions = true;
	}

	update() {
		if (this._needsUpdatePositions) {
			if (this._animation && this._animation.frame <= this._animation.totalFrames) {
				const ps = this.positions.array;
				for (let i = 0; i < this._animation.nps.length; i += 3) {
					// Extract the coordinates of the current vertex in A and A'
					const xOps = this._animation.ops[i];
					const yOps = this._animation.ops[i + 1];
					const zOps = this._animation.ops[i + 2];

					const xNps = this._animation.nps[i];
					const yNps = this._animation.nps[i + 1];
					const zNps = this._animation.nps[i + 2];

					// Linear interpolation for each coordinate
					ps[i] = xOps + (this._animation.frame / this._animation.totalFrames) * (xNps - xOps);
					ps[i + 1] = yOps + (this._animation.frame / this._animation.totalFrames) * (yNps - yOps);
					ps[i + 2] = zOps + (this._animation.frame / this._animation.totalFrames) * (zNps - zOps);
				}
				this._animation.frame++;
				if (this._animation.frame > this._animation.totalFrames) this._animation = undefined;
			}
			this.mesh.geometry.attributes.position.needsUpdate = true;
			if (!this._animation) this._needsUpdatePositions = false;
		}
		if (this._needsUpdateVisibilities) {
			this.mesh.geometry.attributes.visibility.needsUpdate = true;
			this._needsUpdateVisibilities = false;
		}
	}

	/**
	 * Deletes this from scene
	 */
	dispose() {
		this.geometry.dispose();
		this.material.dispose();
	}
}
