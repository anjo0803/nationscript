const { ZombieAction } = require('../enums');
const {
	num,
	txt
} = require('../requests/converter');

/**
 * Container object for data on a nation's Z-Day behaviour.
 * @typedef {object} ZombieDataNation
 * @prop {string} intended The {@linkcode ZombieAction} the nation pursues.
 * @prop {string} action The {@linkcode ZombieAction} the nation is actually executing.
 * @prop {number} survivors Total number of citizens alive and well in the nation.
 * @prop {number} zombies Total number of zombified citizens in the nation.
 * @prop {number} dead Total number of deceased citizens in the nation.
 */
/**
 * Builds a zombie data object from the provided parsed response XML.
 * @param {object} root The root object - the `<ZOMBIE>` tag in the parsed XML object.
 * @returns {ZombieDataNation} The built zombie data object.
 */
exports.parseZombieNation = (root) => {
	return {
		action:		txt(root, 'ZACTION') ?? ZombieAction.INACTION,	// Sometimes they're empty, idk
		intended:	txt(root, 'ZACTIONINTENDED') ?? txt(root, 'ZACTION') ?? ZombieAction.INACTION,
		survivors:	num(root, 'SURVIVORS'),
		zombies:	num(root, 'ZOMBIES'),
		dead:		num(root, 'DEAD')
	}
}
