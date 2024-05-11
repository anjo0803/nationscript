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
 * @type {import('../factory').FactoryConstructor<types.ListCard>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.onTag('CARDID', (me) => me
		.build('id', convertNumber))
	.onTag('SEASON', (me) => me
		.build('season', convertNumber))
	.onTag('CATEGORY', (me) => me
		.build('rarity'));
