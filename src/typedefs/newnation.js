/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	attr,
	num,
	txt
} = require('../requests/converter');

/**
 * Represents the founding details of a newly founded nation.
 * @typedef {object} NewNation
 * @prop {string} nation Name of the nation.
 * @prop {string} region Name of the region the nation was founded in.
 * @prop {number} founded Unix epoch timestamp of when the nation was founded.
 */
/**
 * Builds a new-nation details object from the provided parsed response XML.
 * @param {object} nation The root object - a `<NEWNATIONDETAILS>` tag in the parsed XML object.
 * @returns {NewNation} The built new-nation details object.
 * @ignore
 */
exports.parseNewNationsDetails = (nation) => {
	return {
		nation:	attr(nation, 'NAME'),
		region:	txt(nation, 'REGION'),
		founded:num(nation, 'FOUNDEDTIME')
	};
}
