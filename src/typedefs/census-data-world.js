/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { CensusScale } = require('../enums');
const {
	attr,
	num
} = require('../requests/converter');

/**
 * Container object for the average national score on a given World Census scale.
 * @typedef {object} WCensusAverage
 * @prop {number} id ID of the scale the average is for.
 * @prop {number} average World-wide average score of nations on the scale.
 * @see {@linkcode CensusScale} for possible scale IDs.
 */
/**
 * Builds a census-average object from the provided parsed response XML.
 * @param {object} scale The root object - a `<SCALE>` tag in the parsed XML object.
 * @returns {WCensusAverage} The built census-average object.
 * @ignore
 */
exports.parseCensusWorld = (scale) => {
	return {
		id: attr(scale, 'ID'),
		average: num(scale, 'SCORE'),
	};
}
