/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	convertNumber
} = require('../factory');
const types = require('../types');

/**
 * @type {import('../factory').FactoryConstructor<types.CensusDataNation>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.set('id', convertNumber(root['id']))
	.onTag('SCORE', (me) => me
		.build('score', convertNumber))
	.onTag('RANK', (me) => me
		.build('rankWorld', convertNumber))
	.onTag('PRANK', (me) => me
		.build('rankWorldPercent', convertNumber))
	.onTag('RRANK', (me) => me
		.build('rankRegion', convertNumber))
	.onTag('PRRANK', (me) => me
		.build('rankRegionPercent', convertNumber));
