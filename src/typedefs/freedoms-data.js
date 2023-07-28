const { txt } = require('../requests/converter');

/**
 * Container object holding data on a nation's civil, economic, and political freedoms.
 * @typedef {object} FreedomsData
 * @prop {string} civil Description of the nation's civil rights situation.
 * @prop {string} economic Description of the extent of economic freedom the nation grants.
 * @prop {string} political Description of the level of the nation's political freedom.
 * @deprecated in favor of `FreedomsTextData`.
 */
/**
 * Builds a freedoms data object from the provided parsed response XML.
 * @param {object} root The root object - the `<FREEDOM>` tag in the parsed XML object.
 * @returns {FreedomsData} The built freedoms data object.
 * @deprecated in favor of `parseFreedomsText`.
 * @ignore
 */
exports.parseFreedoms = (root) => {
	return {
		civil:		txt(root, 'CIVILRIGHTS'),
		economic:	txt(root, 'ECONOMY'),
		political:	txt(root, 'POLITICALFREEDOM')
	};
}
