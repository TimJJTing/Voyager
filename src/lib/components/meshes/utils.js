import { RAYCAST_LAYER } from '$lib/components/providers/scene';

/**
 * add mesh to postprocess
 * @param {boolean} enable
 * @param {import("$lib/utils/SelectiveBloom").SelectiveBloom | null | undefined} postprocessor
 * @param {import('three').Mesh|undefined} mesh
 */
export const usePostProcessor = (enable, postprocessor, mesh) => {
	if (postprocessor && mesh) {
		if (enable) {
			postprocessor.add(mesh);
		} else {
			postprocessor.remove(mesh);
		}
	}
};

/**
 * add mesh to raycast layer
 * @param {boolean} enable
 * @param {import('three').Mesh|undefined} mesh
 */
export const useRaycast = (enable, mesh) => {
	if (mesh) {
		if (enable) {
			mesh.layers.enable(RAYCAST_LAYER);
		} else {
			mesh.layers.disable(RAYCAST_LAYER);
		}
	}
};
