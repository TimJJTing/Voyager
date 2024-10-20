<script>
	import { onMount, onDestroy } from 'svelte';
	import {
		RAYCAST_LAYER,
		getScene,
		getFuncPipelines,
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

	let id = {};
	let scene = getScene();
	let funcPipelines = getFuncPipelines();

	$: if (raycast) {
		mesh.getMesh().layers.enable(RAYCAST_LAYER);
	} else {
		mesh.getMesh().layers.disable(RAYCAST_LAYER);
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
		mesh.dispose();
	});
</script>
