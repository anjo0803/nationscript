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
 * Container object for data on a nation's performance on a World Census scale.
 * @typedef {object} CensusDataNation
 * @prop {number} id ID of the {@linkcode CensusScale} the rank is for.
 * @prop {number} score Raw score.
 * @prop {number} rankRegion Rank within the region.
 * @prop {number} rankRegionPercent Percentile within the region.
 * @prop {number} rankWorld Rank world-wide.
 * @prop {number} rankWorldPercent Percentile world-wide. 
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<CensusDataNation>} A new `CensusDataNation` factory
 */
exports.create = root => new NSFactory()
	.set('id', convertNumber(root['id']))
	.onTag('SCORE', me => me
		.build('score', convertNumber))
	.onTag('RANK', me => me
		.build('rankWorld', convertNumber))
	.onTag('PRANK', me => me
		.build('rankWorldPercent', convertNumber))
	.onTag('RRANK', me => me
		.build('rankRegion', convertNumber))
	.onTag('PRRANK', me => me
		.build('rankRegionPercent', convertNumber));
