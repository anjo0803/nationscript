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
 * @type {import('../factory').FactoryConstructor<types.Deck>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.onTag('ID', (me) => me
		.build('nationID', convertNumber))
	.onTag('NAME', (me) => me
		.build('nationName'))
	.onTag('BANK', (me) => me
		.build('bank', convertNumber))
	.onTag('DECK_CAPACITY_RAW', (me) => me
		.build('capacity', convertNumber))
	.onTag('NUM_CARDS', (me) => me
		.build('numCards', convertNumber))
	.onTag('DECK_VALUE', (me) => me
		.build('value', convertNumber))
	.onTag('LAST_VALUED', (me) => me
		.build('valueTime', convertNumber))
	.onTag('RANK', (me) => me
		.build('rank', convertNumber))
	.onTag('REGION_RANK', (me) => me
		.build('rankRegion', convertNumber))
	.onTag('LAST_PACK_OPENED', (me) => me
		.build('lastPack', convertNumber));
