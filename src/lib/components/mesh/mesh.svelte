<script>
	import { onMount, onDestroy } from 'svelte';
	import {
		RAYCAST_LAYER,
		getScene,
		getFuncPipelines,
		getPostprocessor
	} from '$lib/components/providers/scene';

	/**
	 * mesh to add into scene
	 * @type {any}
	 */
	export let mesh;

	/**
	 * enable raycasting?
	 * @type {boolean}
	 */
	export let raycast = false;

	/**
	 * add to postprocess?
	 * @type {boolean}
	 */
	export let postprocess = false;

	let id = {};
	let scene = getScene();
	let funcPipelines = getFuncPipelines();
	let postprocessor = getPostprocessor();

	$: if (raycast) {
		mesh.getMesh().layers.enable(RAYCAST_LAYER);
	} else {
		mesh.getMesh().layers.disable(RAYCAST_LAYER);
	}

	$: if (postprocess) {
		$postprocessor?.add(mesh.getMesh());
	} else {
		$postprocessor?.remove(mesh.getMesh());
	}

	onMount(() => {
		// add mesh into scene
		if ($scene) {
			$scene.add(mesh.getMesh());
		}
		$funcPipelines.registerUpdateFunc(id, () => {
			mesh.update();
		});
	});

	onDestroy(() => {
		$funcPipelines.deregisterUpdateFunc(id);
		$postprocessor?.remove(mesh.getMesh());
		$scene?.remove(mesh.getMesh());
		mesh.dispose();
	});
</script>
