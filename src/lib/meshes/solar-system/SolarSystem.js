// @ts-nocheck
import * as THREE from 'three';
export class SolarSystem {
	/**
	 * Solar System
	 * @returns this
	 */
	constructor(sun, name, planets = []) {
		this.clock = new THREE.Clock();

		this.sun = sun;
		this.planets = planets || [];
		this.name = name;

		this._time = this.clock.getElapsedTime();

		this.group = this._createGroup();

		return this;
	}

	_createGroup() {
		const group = new THREE.Group();
		group.add(this.sun.getMesh());
		for (let i = 0; i < this.planets.length; i++) {
			group.add(this.planets[i].getMesh());
		}
		return group;
	}

	/**
	 * @return p {THREE.Vector3}
	 */
	get position() {
		return this.sun.position;
	}
	/**
	 * @param p {THREE.Vector3}
	 */
	set position(p) {
		this.sun.position.copy(p);
	}

	getMesh() {
		return this.group;
	}

	addPlanet(planet) {
		planet.position.set(this.sun.position.x + planet.au, this.sun.position.y, this.sun.position.z);
		this.planets.push(planet);
		this.group.add(planet.getMesh());
	}

	removePlanet(planet) {
		const index = this.planets.indexOf(planet);
		if (index !== -1) {
			this.planets.splice(index, 1);
			this.group.remove(planet.getMesh());
		}
	}

	resetClock() {
		this.clock.stop();
		this.clock.start();
	}

	set visible(v) {
		this.group.visible = v;
	}

	/**
	 * @param v {boolean}
	 */
	// set visible(v) {
	// 	this.star.visible = v;
	// }
	/**
	 * @param p {THREE.Vector3}
	 */
	// lookAt(p) {
	// 	this.star.lookAt(p);
	// }
	/**
	 * Return the LOD Object3D
	 */
	// getMesh() {
	// 	return this.lod;
	// }

	update() {
		this._time = this.clock.getElapsedTime();
		this.sun.update();
		for (let i = 0, planet; i < this.planets.length; i++) {
			planet = this.planets[i];
			planet.position.x = this.sun.position.x + planet.au * Math.cos(this._time * planet.revolutionSpeed);
			planet.position.y = this.sun.position.y;
			planet.position.z = this.sun.position.z + planet.au * Math.sin(this._time * planet.revolutionSpeed);
			planet.update();
		}
	}

	/**
	 * Deletes this from scene
	 */
	dispose() {
		this.clock.stop();
		this.group.clear();
		this.sun.dispose();
		for (let i = 0; i < this.planets.length; i++) {
			this.planets[i].dispose();
		}
	}
}
