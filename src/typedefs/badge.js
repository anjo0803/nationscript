const { WABadgeType } = require('../enums');
const { attr } = require('../requests/converter')

/**
 * Represents a commendation, condemnation, liberation, or injunction badge displayed
 * on a nation or region as a result of an active Security Council resolution.
 * @typedef {object} WABadge
 * @prop {number} resolution ID of the SC resolution imposing the badge.
 * @prop {string} type {@linkcode WABadgeType} of the badge.
 */
/**
 * Builds a badge object from the provided parsed response XML.
 * @param {object} badge The root object - a `<WABADGE>` tag in the parsed XML object.
 * @returns {WABadge} The built badge object.
 * @ignore
 */
exports.parseBadge = (badge) => {
	return {
		resolution: parseInt(badge['$text']),
		type: attr(badge, 'TYPE')
	};
}
