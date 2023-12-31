const { num } = require('../requests/converter');

/**
 * Container object for data on the Z-Day performance of a region's resident nations.
 * @typedef {object} ZombieDataRegion
 * @prop {number} survivors Total number of national citizens alive and well in the region.
 * @prop {number} zombies Total number of zombified national citizens in the region.
 * @prop {number} dead Total number of deceased national citizens in the region.
 */
/**
 * Builds a zombie data object from the provided parsed response XML.
 * @param {object} root The root object - the `<ZOMBIE>` tag in the parsed XML object.
 * @returns {ZombieDataRegion} The built zombie data object.
 * @ignore
 */
exports.parseZombieRegion = (root) => {
	return {
		survivors:	num(root, 'SURVIVORS'),
		zombies:	num(root, 'ZOMBIES'),
		dead:		num(root, 'DEAD')
	}
}
