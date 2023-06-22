const {
	num,
	txt
} = require('../requests/converter');

/**
 * Represents a happening event in the NationStates world.
 * @typedef {object} Happening
 * @prop {number} timestamp Unix epoch timestamp of when the happening occurred.
 * @prop {string} text Text description of what transpired in the happening.
 */
/**
 * Builds a happening object from the provided parsed response XML.
 * @param {object} event The root object - a `<HAPPENING>` tag in the parsed XML object.
 * @returns {Happening} The built happening object.
 */
exports.parseHappening = (event) => {
	return {
		timestamp: num(event, 'TIMESTAMP'),
		text: txt(event, 'TEXT')
	};
}
