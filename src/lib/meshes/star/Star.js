// @ts-nocheck
import * as THREE from 'three';
import { _Star } from './_Star';

export class Star {
	/**
	 * Planet with LOD
	 * @param {THREE.Vector3} color color of the star
	 * @param {number} radius radius of the sphere
	 * @param {number} speed rotation speed
	 * @returns this
	 */
	constructor(color = new THREE.Vector3(1, 1, 1), radius = 1, speed = 1) {
		this.radius = radius;
		this._radius = radius;
		this.speed = speed;
		this.color = color;
		// differential rotation constants: https://en.wikipedia.org/wiki/Solar_rotation
		this.diffRotationCA = 14.713; // constant A
		this.diffRotationCB = -2.396; // constant B
		this.diffRotationCC = -1.787; // constant C
		this.needsUpdate = false;

		this.levels = [
			new _Star(this.radius, 5, this.speed, this.color, true), // only lv0 needs light
			new _Star(this.radius, 2, 0, this.color),
			new _Star(this.radius, 0, 0, this.color)
		];

		this.lod = this._createLOD();

		return this;
	}

	/**
	 * Create lods for Planet
	 * @returns {THREE.LOD} lod
	 */
	_createLOD() {
		const lod = new THREE.LOD();
		for (let i = 0; i < this.levels.length; i++) {
			lod.addLevel(this.levels[i].mesh, i * 800); //0
		}
		return lod;
	}

	/**
	 * @return {THREE.Vector3} p
	 */
	get position() {
		return this.lod.position;
	}
	/**
	 * @param {THREE.Vector3} p
	 */
	set position(p) {
		this.lod.position.copy(p);
	}

	/**
	 * @param {boolean} v
	 */
	set visible(v) {
		this.lod.visible = v;
	}
	/**
	 * @param {THREE.Vector3} p
	 */
	lookAt(p) {
		this.lod.lookAt(p);
	}
	/**
	 * Return the LOD Object3D
	 */
	getMesh() {
		return this.lod;
	}

	/**
	 * Reset the clock
	 */
	resetClock() {
		for (let i = 0; i < this.levels.length; i++) {
			this.levels[i].resetClock();
		}
	}

	update() {
		if (this.needsUpdate) {
			for (let i = 0, level; i < this.levels.length; i++) {
				level = this.levels[i];
				level.color = this.color;
				level.mesh.geometry.scale(
					this.radius / this._radius,
					this.radius / this._radius,
					this.radius / this._radius
				);
				level.diffRotationCA = this.diffRotationCA; // constant A
				level.diffRotationCB = this.diffRotationCB; // constant B
				level.diffRotationCC = this.diffRotationCC; // constant C
				level.needsUpdate = true;
				level.update();
			}
			this.needsUpdate = false;
		}
		// this.lod.levels[this.lod.getCurrentLevel()].object.update();
		this.levels[0].update();
	}

	/**
	 * Deletes this from scene
	 */
	dispose() {
		for (let i = 0; i < this.levels.length; i++) {
			this.levels[i].dispose();
		}
		this.lod.clear();
	}
}
