<script>
	import { onMount, onDestroy } from 'svelte';
	import {
		getScene,
		getCamera,
		getFuncPipelines,
		getPostprocessor
	} from '$lib/components/providers/scene';
	import { buildPointOctree } from './buildPointOctree';
	import { FrustumCuller } from '$lib/utils/FrustumCuller';
	import { usePostProcessor } from '../utils';

	export let positions;
	export let groups;
	export let ids;

	/**
	 * add to postprocess?
	 * @type {boolean}
	 */
	export let postprocess = false;

	/**
	 * @type {undefined|import('sparse-octree').PointOctree<any>}
	 */
	export let octree = undefined;

	/**
	 * @type {undefined|FrustumCuller}
	 */
	let frustumCuller = undefined;

	/**
	 * @type {import('three').Mesh|undefined}
	 */
	let fcHDParticles = undefined;
	/**
	 * @type {import('three').Mesh|undefined}
	 */
	let fcSDParticles;
	/**
	 * @type {import('three').Mesh|undefined}
	 */
	let fcLDParticles;

	let id = {};
	let scene = getScene();
	let camera = getCamera();
	let funcPipelines = getFuncPipelines();
	let postprocessor = getPostprocessor();

	$: usePostProcessor(postprocess, $postprocessor, fcHDParticles);
	$: usePostProcessor(postprocess, $postprocessor, fcSDParticles);
	$: usePostProcessor(postprocess, $postprocessor, fcLDParticles);

	onMount(() => {
		// add mesh into scene
		if ($scene && $camera) {
			octree = buildPointOctree($scene, positions, groups, ids);

			// Frustum culling for Octree
			frustumCuller = new FrustumCuller(octree, $camera, 500, 600);
			// frustum culled points are points with more detail and interactive
			fcHDParticles = frustumCuller.getHDMesh();
			$scene.add(fcHDParticles);

			fcSDParticles = frustumCuller.getSDMesh();
			$scene.add(fcSDParticles);

			fcLDParticles = frustumCuller.getLDMesh();
			$scene.add(fcLDParticles);
			// if ($option.octantHelperEnabled) scene.add(frustumCuller.getOctantHelper());
			// if ($option.cameraHelperEnabled) scene.add(frustumCuller.getCameraHelper());
			// if ($option.labelsEnabled) scene.add(frustumCuller.getLabels());

			frustumCuller.cull();
			$funcPipelines.registerUpdateFunc(id, () => {
				frustumCuller.cull();
			});
		}
	});

	onDestroy(() => {
		$funcPipelines.deregisterUpdateFunc(id);
		if (frustumCuller) {
			$scene?.remove(frustumCuller.getHDMesh());
			$scene?.remove(frustumCuller.getSDMesh());
			$scene?.remove(frustumCuller.getLDMesh());
			frustumCuller.dispose();
		}
	});
</script>
