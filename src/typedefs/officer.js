const { OfficerAuthority } = require('../enums');
const {
	num,
	txt
} = require('../requests/converter');

/**
 * Represents a regional officer of a region.
 * @typedef {object} Officer
 * @prop {string} nation Name of the officer nation.
 * @prop {string} office Name of the office held by the officer.
 * @prop {string} appointer Name of the nation that appointed the officer.
 * @prop {string[]} authorities List of the officer's {@linkcode OfficerAuthority} codes.
 * @prop {number} appointment Unix epoch timestamp for when the officer was appointed.
 * @prop {number} order 1-indexed position on which the officer is displayed.
 */
/**
 * Builds an officer object from the provided parsed response XML.
 * @param {object} o The root object - the `<OFFICER>` tag in the parsed XML object.
 * @returns {Officer} The built officer object.
 */
exports.parseOfficer = (o) => {
	return {
		nation:			txt(o, 'NATION'),
		office:			txt(o, 'OFFICE'),
		appointer:		txt(o, 'BY'),
		authorities:	[...(txt(o, 'AUTHORITY') ?? [])],
		appointment:	num(o, 'TIME'),
		order:			num(o, 'ORDER')
	};
}
