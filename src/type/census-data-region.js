/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { CensusScale } = require('../enums');
const {
	NSFactory,
	convertNumber
} = require('../factory');

/**
 * Container object for data on a region's performance on a World Census scale,
 * depending on its residents' scores on it.
 * @typedef {object} CensusDataRegion
 * @prop {number} id ID of the {@linkcode CensusScale} the rank is for.
 * @prop {number} average Average score of the region's residents on the scale.
 * @prop {number} rank Rank of the region on the scale.
 * @prop {number} rankPercent Percentile of the region on the scale. 
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<CensusDataRegion>} A new `CensusDataRegion` factory
 */
exports.create = root => new NSFactory()
	.set('id', convertNumber(root['id']))
	.onTag('SCORE', me => me
		.build('average', convertNumber))
	.onTag('RANK', me => me
		.build('rank', convertNumber))
	.onTag('PRANK', me => me
		.build('rankPercent', convertNumber));
