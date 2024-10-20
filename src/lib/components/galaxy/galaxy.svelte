<script>
	import * as THREE from 'three';
	import { Scene } from '$lib/components/providers/scene';
	import { Particles } from '$lib/meshes/particles';
	// import { Planet } from '$lib/meshes/planet';
	import { Star } from '$lib/meshes/star';
	import { Mesh } from '$lib/components/mesh';
	import { processData, groupColors } from '$lib/utils';

	let data = [];
	let n = 100,
		n2 = n / 2; // particles spread in the cube
	for (let i = 0; i < 200; i++) {
		let point = {};
		// positions
		point['x'] = Math.random() * n - n2;
		point['y'] = Math.random() * n - n2;
		point['z'] = Math.random() * n - n2;
		point['group'] = 0;
		point['id'] = i.toString();
		data.push(point);
	}
	let { positions, colors, groups, ids } = processData(data, groupColors);
	let particles = new Particles(positions, colors, groups);
	let star = new Star(new THREE.Vector3(1, 1, 1), 1);
</script>

<Scene>
	<Mesh mesh={particles} />
	<Mesh mesh={star} />
</Scene>
