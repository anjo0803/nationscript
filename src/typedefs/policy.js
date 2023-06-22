const { txt } = require('../requests/converter');

/**
 * Represents a national policy.
 * @typedef {object} Policy
 * @prop {string} category General field the policy concerns.
 * @prop {string} name Name of the policy.
 * @prop {string} description Short description of the policy content.
 * @prop {string} image ID of the policy banner image.
 */
/**
 * Builds a policy object from the provided parsed response XML.
 * @param {object} policy The root object - a `<POLICY>` tag in the parsed XML object.
 * @returns {Policy} The built policy object.
 */
exports.parsePolicy = (policy) => {
	return {
		category:	txt(policy, 'CAT'),
		name:		txt(policy, 'NAME'),
		description:txt(policy, 'DESC'),
		image:		txt(policy, 'PIC')
	};
}
