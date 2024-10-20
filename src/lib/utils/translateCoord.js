const distanceFactor = 1;

/**
 * Translate coordinates from the original to the visualized
 * @param {number} x coord x
 * @param {number} y coord y
 * @param {number} z coord z
 * @returns {number[]} translated coordinate
 */
export const translateCoord = (x, y, z) => {
	return [x * distanceFactor, y * distanceFactor, z * distanceFactor];
};
