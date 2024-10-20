// @ts-nocheck
import * as THREE from 'three';

export const addLighting = (scene) => {
	const light = new THREE.HemisphereLight(0xffffff, 0x888888, 3);
	light.position.set(0, 1, 0);
	scene.add(light);
    // return light;
};
