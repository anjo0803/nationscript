const { num } = require('../requests/converter');

/**
 * Container object holding numerical data on a nation's civil, economic, and political freedoms,
 * all rounded to the nearest integer value.
 * @typedef {object} FreedomsScoreData
 * @prop {string} civil The nation's civil rights score.
 * @prop {string} economic The nation's economical freedom score.
 * @prop {string} political The nation's political freedom score.
 */
/**
 * Builds a freedoms score data object from the provided parsed response XML.
 * @param {object} root The root object - the `<FREEDOMSCORES>` tag in the parsed XML object.
 * @returns {FreedomsScoreData} The built freedoms score data object.
 * @ignore
 */
exports.parseFreedomsValue = (root) => {
	return {
		civil:		num(root, 'CIVILRIGHTS'),
		economic:	num(root, 'ECONOMY'),
		political:	num(root, 'POLITICALFREEDOM')
	};
}
