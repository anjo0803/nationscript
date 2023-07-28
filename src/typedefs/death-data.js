const { DeathCause } = require('../enums');
const { attr } = require('../requests/converter');

/**
 * Represents a cause of death with its prevalence in a nation.
 * @typedef {object} DeathData
 * @prop {string} cause {@linkcode DeathCause} the data describes.
 * @prop {number} percent Percentage of yearly deaths in the nation ascribed to the cause.
 */
/**
 * Builds a death data object from the provided parsed response XML.
 * @param {object} nation The root object - a `<CAUSE>` tag in the parsed XML object.
 * @returns {DeathData} The built death data object.
 * @ignore
 */
exports.parseDeath = (cause) => {
	return {
		cause: attr(cause, 'TYPE'),
		percent: parseFloat(cause['$text'])
	}
}
