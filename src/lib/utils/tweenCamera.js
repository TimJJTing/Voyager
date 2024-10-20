import * as TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';

/**
 * Get a TWEEN.Tween object for tweening camera target
 * @param {import('three/addons/controls/OrbitControls.js').OrbitControls} controls Three.js OrbitCOntrol
 * @param {THREE.Vector3} target Three.js Vector3
 * @param {number} duration tween duration in milliseconds
 * @returns {TWEEN.Tween<THREE.Vector3>} tweening object
 */
export const setControlsTarget = (controls, target, duration = 2000) => {
	const changeControlsTarget = new TWEEN.Tween(controls.target)
		.to({ x: target.x, y: target.y, z: target.z }, duration)
		.easing(TWEEN.Easing.Quadratic.InOut)
		.onUpdate(() => {
			controls.enabled = false;
		})
		.onComplete(() => {
			controls.enabled = true;
		});
	return changeControlsTarget;
};

/**
 * Get a TWEEN.Tween object for tweening camera position
 * @param {THREE.Camera} camera Three.js Camera
 * @param {import('three/addons/controls/OrbitControls.js').OrbitControls} controls Three.js OrbitCOntrol
 * @param {THREE.Vector3} target Three.js Vector3
 * @param {number} duration tween duration in milliseconds
 * @param {number} distance distance to the target, leave it null or undefined to keep the current distance
 * @param {boolean} faceOrigin if true, origin, target and camera will be on the same line.
 * @returns {TWEEN.Tween<THREE.Vector3>} tweening object
 */
export const setCameraPosition = (
	camera,
	controls,
	target,
	duration = 2000,
	distance = 4,
	faceOrigin = false
) => {
	const _position = new THREE.Vector3();
	if (faceOrigin) {
		_position.copy(target);
	} else {
		_position.subVectors(camera.position, target);
	}
	// in case the target is origin
	if (_position.x === 0 && _position.y === 0 && _position.z === 0) _position.set(1, 1, 1);
	const position = _position.normalize().multiplyScalar(distance).add(target);
	const changeCamPosition = new TWEEN.Tween(camera.position)
		.to(
			{
				x: position.x,
				y: position.y,
				z: position.z
			},
			duration
		)
		.easing(TWEEN.Easing.Quadratic.InOut)
		.onUpdate(() => {
			controls.enabled = false;
		})
		.onComplete(() => {
			controls.enabled = true;
		});
	return changeCamPosition;
};

/**
 * Tween the camera for focusing on a new target, moving to a new position, or both
 * @param {THREE.Camera} camera Three.js Camera
 * @param {import('three/addons/controls/OrbitControls.js').OrbitControls} controls Three.js OrbitCOntrol
 * @param {THREE.Vector3} target New target to focus on
 * @param {number|undefined|null} distance distance to the target, leave it null or undefined to keep the current distance so the camera position won't change
 * @param {number} targetingDuration tween duration for setting the new target to focus on in milliseconds
 * @param {number} movingDuration tween duration for moving camera position in milliseconds
 * @param {boolean} chain chain the camera target and camera position tweenings one after one or simultaneously
 * @param {boolean} faceOrigin if true, origin, target and camera will be on the same line after moving. Only effective when distance is not null or undefined
 * @param {boolean} clearPreviousTweens if true, all existing tweens will be cleared before this tween starts
 */
export const tweenCamera = (
	camera,
	controls,
	target,
	distance = 4,
	targetingDuration = 1000,
	movingDuration = 1000,
	chain = false,
	faceOrigin = false,
	clearPreviousTweens = true
) => {
	if (clearPreviousTweens) {
		// remove all tweens tp prevent weird outcomes
		TWEEN.removeAll();
	}
	const tweenTarget = setControlsTarget(controls, target, targetingDuration);
	let tweenPosition;
	if (typeof distance === 'number') {
		tweenPosition = setCameraPosition(
			camera,
			controls,
			target,
			movingDuration,
			distance,
			faceOrigin
		);
	}
	if (tweenPosition && chain) {
		tweenTarget.chain(tweenPosition);
	} else if (tweenPosition) {
		tweenPosition.start();
	}
	tweenTarget.start();
};
