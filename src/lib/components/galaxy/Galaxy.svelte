<script>
	import * as THREE from 'three';
	import { Scene } from '$lib/components/providers/scene';
	import { Particles } from '$lib/meshes/particles';
	// import { Planet } from '$lib/meshes/planet';
	import { Star } from '$lib/meshes/star';
	import { Mesh, ParticleOctree } from '$lib/components/meshes';
	import { translateCoord } from '$lib/utils';

	export let data = [];

	const color = new THREE.Color();
	// coord
	const positions = [];
	const colors = [];
	const groups = [];
	const ids = [];
	for (let i = 0; i < data.length; i++) {
		// positions
		let [x, y, z] = translateCoord(data[i].x, data[i].y, data[i].z);
		positions.push(x, y, z);

		// colors
		// let r = groupColors[data[i].group][0];
		// let g = groupColors[data[i].group][1];
		// let b = groupColors[data[i].group][2];
		color.setStyle(`rgb(255,255,255)`);
		colors.push(color.r, color.g, color.b);

		// group
		groups.push(0);

		// plates
		ids.push(i);
	}
	let particles = new Particles(positions, colors, groups);
	let star = new Star(new THREE.Vector3(1, 1, 1), 1);
</script>

<Scene stats>
	<Mesh mesh={particles} />
	<Mesh mesh={star} postprocess />
	<ParticleOctree {positions} {groups} {ids} postprocess />
</Scene>
