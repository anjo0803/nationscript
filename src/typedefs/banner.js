const {
	attr,
	txt
} = require('../requests/converter');

/**
 * Represents a national banner.
 * @typedef {object} Banner
 * @prop {string} id ID of the banner.
 * @prop {string} name Full name of the banner.
 * @prop {string} condition (Vague) description of the banner's unlock condition.
 */
/**
 * Builds a banner object from the provided parsed response XML.
 * @param {object} banner The root object - a `<BANNER>` tag in the parsed XML object.
 * @returns {Banner} The built banner object.
 */
exports.parseBanner = (banner) => {
	return {
		id:			attr(banner, 'ID'),
		name:		txt(banner, 'NAME'),
		condition:	txt(banner, 'VALIDITY')
	};
}
