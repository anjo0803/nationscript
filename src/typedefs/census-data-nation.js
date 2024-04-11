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
 * Container object holding data on a nation's performance on a World Census scale.
 * @typedef {object} CensusDataNation
 * @prop {number} id ID of the {@linkcode CensusScale} the rank is for.
 * @prop {number} score Raw score of the nation on the scale.
 * @prop {number} rankRegion Rank of the nation on the scale within their region.
 * @prop {number} rankRegionPercent Percentile of the nation on the scale within their region.
 * @prop {number} rankWorld Rank of the nation on the scale world-wide.
 * @prop {number} rankWorldPercent Percentile of the nation on the scale world-wide. 
 */
/**
 * Builds a rank object from the provided parsed response XML.
 * @param {object} scale The root object - a `<SCALE>` tag in the parsed XML object.
 * @returns {CensusDataNation} The built rank object.
 * @ignore
 */
exports.parseCensusNation = (scale) => {
	return {
		id: parseInt(attr(scale, 'ID')),
		score:				num(scale, 'SCORE'),
		rankRegion:			num(scale, 'RRANK'),
		rankRegionPercent:	num(scale, 'PRRANK'),
		rankWorld:			num(scale, 'RANK'),
		rankWorldPercent:	num(scale, 'PRANK')
	};
}
