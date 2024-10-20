// @ts-nocheck
import * as THREE from 'three';
import { PointOctree } from 'sparse-octree';

/**
 * Octree for points for rendering optimization
 * @param {*} scene
 * @param {any[]} positions
 * @param {any[]} cluster
 * @param {any[]} plates
 * @returns octree
 */
export const addOctree = (scene, positions, cluster, plates) => {
	const v = new THREE.Vector3();
	const bbox = new THREE.Box3();
	bbox.setFromObject(scene);

	const octree = new PointOctree(bbox.min, bbox.max, 0.0, 8, 5);

	for (let j = 0, l = positions.length; j < l; j += 3) {
		octree.set(v.fromArray(positions, j), {
			index: j / 3,
			cluster: cluster[j / 3],
			plate: plates[j / 3],
		});
	}
	return octree;
};
