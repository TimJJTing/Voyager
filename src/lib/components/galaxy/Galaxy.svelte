<script>
	import * as THREE from 'three';
	import { Scene } from '$lib/components/providers/scene';
	import { Particles } from '$lib/meshes/particles';
	// import { Planet } from '$lib/meshes/planet';
	import { Star } from '$lib/meshes/star';
	import { Mesh, ParticleOctree } from '$lib/components/meshes';
	import { processData, groupColors } from '$lib/utils';

	export let data = [];
	for (let i = 0; i < data.length; i++) {
		let point = {};
		// positions
		point['x'] = data[i].x;
		point['y'] = data[i].y;
		point['z'] = data[i].z;
		point['group'] = 0;
		point['id'] = i.toString();
		data.push(point);
	}
	let { positions, colors, groups, ids } = processData(data, groupColors);
	let particles = new Particles(positions, colors, groups);
	let star = new Star(new THREE.Vector3(1, 1, 1), 1);
	
</script>

<Scene stats>
	<Mesh mesh={particles} />
	<Mesh mesh={star} postprocess />
	<ParticleOctree {positions} {groups} {ids} postprocess/>
</Scene>
