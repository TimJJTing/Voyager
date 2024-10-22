import * as THREE from 'three';
import { PointOctree } from 'sparse-octree';

/**
 * Build Octree for points for rendering optimization
 * @param {*} scene
 * @param {any[]} positions
 * @param {any[]} groups
 * @param {any[]} ids
 * @returns {PointOctree<any>} octree
 */
export const buildPointOctree = (scene, positions, groups, ids) => {
	const v = new THREE.Vector3();
	const bbox = new THREE.Box3();
	bbox.setFromObject(scene);

	const octree = new PointOctree(bbox.min, bbox.max, 0.0, 8, 5);
	for (let j = 0, l = positions.length; j < l; j += 3) {
		octree.set(v.fromArray(positions, j), {
			index: j / 3,
			group: groups[j / 3],
			id: ids[j / 3]
		});
	}
	return octree;
};
