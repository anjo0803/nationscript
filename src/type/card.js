/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	ArrayFactory,
	convertNumber
} = require('../factory');
const types = require('../types');

const Market = require('./market');
const TradeCardbound = require('./trade-cardbound');

/**
 * @type {import('../factory').FactoryConstructor<types.Card>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.onTag('CARDID', (me) => me
		.build('id', convertNumber))
	.onTag('CATEGORY', (me) => me
		.build('rarity'))
	.onTag('FLAG', (me) => me
		// Old default flags don't have their .jpg extension appended
		.build('depicted.flag', val => (val.match(/\..+$/g)
			? val
			: val + '.jpg')))
	.onTag('GOVT', (me) => me
		.build('depicted.category'))
	.onTag('MARKET_VALUE', (me) => me
		.build('value', convertNumber))
	.onTag('NAME', (me) => me
		.build('depicted.name'))
	.onTag('OWNERS', (me) => me
		.build('owners')
		.assignSubFactory(ArrayFactory
			.primitive('OWNER')))
	.onTag('REGION', (me) => me
		.build('depicted.region'))
	.onTag('SEASON', (me) => me
		.build('season', convertNumber))
	.onTag('SLOGAN', (me) => me
		.build('depicted.motto'))
	.onTag('TYPE', (me) => me
		.build('depicted.pretitle'))
	.onTag('MARKETS', (me) => me
		.build('asksBids')
		.assignSubFactory(ArrayFactory
			.complex('MARKET', Market.create)))
	.onTag('TRADES', (me) => me
		.build('trades')
		.assignSubFactory(ArrayFactory
			.complex('TRADE', TradeCardbound.create)));
