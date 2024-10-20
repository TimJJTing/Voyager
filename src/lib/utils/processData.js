import * as THREE from 'three';
import { translateCoord } from './translateCoord';
/**
 * Process data for the scene to rendering
 * @param {{id: string, group: number, x: number, y: number, z: number}[]} data extracted data to process
 * @param { number[][] } groupColors coloring dict
 * @returns {{positions: any[], colors: any[], groups: any[], ids: any[]}} {positions, colors, group, plates}
 */
export const processData = (data, groupColors) => {
	const color = new THREE.Color();

	// prepare data
	const positions = [];
	const colors = [];
	const groups = [];
	const ids = [];
	for (let i = 0; i < data.length; i++) {
		// positions
		let [x, y, z] = translateCoord(data[i].x, data[i].y, data[i].z);
		positions.push(x, y, z);

		// colors
		let r = groupColors[data[i].group][0];
		let g = groupColors[data[i].group][1];
		let b = groupColors[data[i].group][2];
		color.setStyle(`rgb(${r},${g},${b})`);
		colors.push(color.r, color.g, color.b);

		// group
		groups.push(data[i].group);

		// plates
		ids.push(data[i].id);
	}
	return { positions, colors, groups, ids };
};
