import { getContext, setContext } from 'svelte';
import { writable } from 'svelte/store';

/**
 * @return {import('svelte/store').Writable<undefined|null|import('three').Scene>}
 */
export function setScene() {
	/**
	 * @type {import('svelte/store').Writable<undefined|null|import('three').Scene>}
	 */
	let scene = writable(undefined);
	setContext('scene', scene);
	return scene;
}
/**
 * @return {import('svelte/store').Writable<undefined|null|import('three').Scene>}
 */
export function getScene() {
	return getContext('scene');
}

/**
 * @return {import('svelte/store').Writable<undefined|null|import('three').PerspectiveCamera>}
 */
export function setCamera() {
	/**
	 * @type {import('svelte/store').Writable<undefined|null|import('three').PerspectiveCamera>}
	 */
	let camera = writable(undefined);
	setContext('camera', camera);
	return camera;
}
/**
 * @return {import('svelte/store').Writable<undefined|null|import('three').PerspectiveCamera>}
 */
export function getCamera() {
	return getContext('camera');
}

/**
 * @return {import('svelte/store').Writable<undefined|null|import('$lib/utils/SelectiveBloom').SelectiveBloom>}
 */
export function setPostprocessor() {
	/**
	 * @type {import('svelte/store').Writable<undefined|null|import('$lib/utils/SelectiveBloom').SelectiveBloom>}
	 */
	let postprocessor = writable(undefined);
	setContext('postprocessor', postprocessor);
	return postprocessor;
}
/**
 * @return {import('svelte/store').Writable<undefined|null|import('$lib/utils/SelectiveBloom').SelectiveBloom>}
 */
export function getPostprocessor() {
	return getContext('postprocessor');
}

/**
 * @return {import('svelte/store').Writable<undefined|null|import('three/addons/controls/OrbitControls.js').OrbitControls>}
 */
export function setControls() {
	/**
	 * @type {import('svelte/store').Writable<undefined|null|import('three/addons/controls/OrbitControls.js').OrbitControls>}
	 */
	let controls = writable(undefined);
	setContext('controls', controls);
	return controls;
}
/**
 * @return {import('svelte/store').Writable<undefined|null|import('three/addons/controls/OrbitControls.js').OrbitControls>}
 */
export function getControls() {
	return getContext('controls');
}

/**
 * @return {import('svelte/store').Writable<undefined|null|import('three').Vector2>}
 */
export function setMouse() {
	/**
	 * @type {import('svelte/store').Writable<undefined|null|import('three').Vector2>}
	 */
	let mouse = writable(undefined);
	setContext('mouse', mouse);
	return mouse;
}
/**
 * @return {import('svelte/store').Writable<undefined|null|import('three').Vector2>}
 */
export function getMouse() {
	return getContext('mouse');
}

/**
 * @return {import('svelte/store').Writable<undefined|null|import('three').Raycaster>}
 */
export function setRaycaster() {
	/**
	 * @type {import('svelte/store').Writable<undefined|null|import('three').Raycaster>}
	 */
	let raycaster = writable(undefined);
	setContext('raycaster', raycaster);
	return raycaster;
}
/**
 * @return {import('svelte/store').Writable<undefined|null|import('three').Raycaster>}
 */
export function getRaycaster() {
	return getContext('raycaster');
}

/**
 * @return {import('svelte/store').Writable<boolean>}
 */
export function setSceneReady() {
	/**
	 * @type {import('svelte/store').Writable<boolean>}
	 */
	let sceneReady = writable(false);
	setContext('sceneReady', sceneReady);
	return sceneReady;
}
/**
 * @return {import('svelte/store').Writable<boolean>}
 */
export function getSceneReady() {
	return getContext('sceneReady');
}

/**
 * @return {import('svelte/store').Writable<undefined|null|import('three').WebGLRenderer>}
 */
export function setRenderer() {
	/**
	 * @type {import('svelte/store').Writable<undefined|null|import('three').WebGLRenderer>}
	 */
	let renderer = writable(undefined);
	setContext('renderer', renderer);
	return renderer;
}

/**
 * @return {import('svelte/store').Writable<undefined|null|import('three').WebGLRenderer>}
 */
export function getRenderer() {
	return getContext('renderer');
}

/**
 * Function pipelines to run in a render cycle:
 * updatePipeline: update()
 * renderPipeline: render()
 * cameraPipeline: only runs when camera position changes
 */
export function setFuncPipelines() {
	const renderPipeline = new Map();
	const updatePipeline = new Map();
	const cameraPipeline = new Map();
	let funcPipelines = writable({
		/**
		 * Pipeline to run in update()
		 * @type {Map<string, function>}
		 */
		updatePipeline,
		/**
		 * register a new update function to the pipeline
		 * @param {any} key
		 * @param {function} func
		 */
		registerUpdateFunc: (key, func) => updatePipeline.set(key, func),
		/**
		 * deregister a update function to the pipeline
		 * @param {any} key
		 */
		deregisterUpdateFunc: (key) => updatePipeline.delete(key),
		/**
		 * Pipeline to run in render()
		 * @type {Map<string, function>}
		 */
		renderPipeline,
		/**
		 * register a new render function to the pipeline
		 * @param {any} key
		 * @param {function} func
		 */
		registerRenderFunc: (key, func) => renderPipeline.set(key, func),
		/**
		 * deregister a render function to the pipeline
		 * @param {any} key
		 */
		deregisterRenderFunc: (key) => renderPipeline.delete(key),
		/**
		 * Pipeline to run on camera changes position
		 * @type {Map<string, function>}
		 */
		cameraPipeline,
		/**
		 * register a new render function to the pipeline
		 * @param {any} key
		 * @param {function} func
		 */
		registerCameraFunc: (key, func) => cameraPipeline.set(key, func),
		/**
		 * deregister a render function to the pipeline
		 * @param {any} key
		 */
		deregisterCameraFunc: (key) => cameraPipeline.delete(key),
	});
	setContext('funcPipelines', funcPipelines);
	return funcPipelines;
}
export function getFuncPipelines() {
	return getContext('funcPipelines');
}
