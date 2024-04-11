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
 * Represents a happening event in the NationStates world.
 * @typedef {object} IDHappening
 * @prop {number} id ID of the happening.
 * @prop {number} timestamp Unix epoch timestamp of when the happening occurred.
 * @prop {string} text Text description of what transpired in the happening.
 */
/**
 * Builds a happening object from the provided parsed response XML.
 * @param {object} event The root object - a `<HAPPENING>` tag in the parsed XML object.
 * @returns {IDHappening} The built happening object.
 * @ignore
 */
exports.parseIDHappening = (event) => {
	return {
		id: parseInt(attr(event, 'ID')),
		timestamp:	num(event, 'TIMESTAMP'),
		text:		txt(event, 'TEXT')
	};
}
