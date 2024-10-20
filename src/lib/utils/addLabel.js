// @ts-nocheck
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export const addLabel = (scene) => {
	const labelDiv = document.createElement('div');
	labelDiv.className = 'label fsc400';
	const labelObject = new CSS2DObject(labelDiv);
	labelObject.visible = false;
	scene.add(labelObject);
	return {object: labelObject, div: labelDiv};
};
