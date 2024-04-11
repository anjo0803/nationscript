/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

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
 * @ignore
 */
exports.parseHappening = (event) => {
	return {
		timestamp: num(event, 'TIMESTAMP'),
		text: txt(event, 'TEXT')
	};
}
