/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	Rarity
} = require('../enums');

const {
	NSFactory,
	ArrayFactory,
	convertNumber
} = require('../factory');

const Market = require('./market');
const TradeCardbound = require('./trade-cardbound');

// TODO figure out what the "info" shard actually returns

/**
 * Represents a nation depicted on a {@link Card}.
 * @typedef {object} CardNation
 * @prop {string} name Nation name (`Proper Form`).
 * @prop {string} motto National motto.
 * @prop {string} pretitle National pretitle.
 * @prop {string} region Region the nation resides in (`Proper Form`).
 * @prop {string} category World Census classification of the nation, e.g. *New
 *     York Times Democracy*.
 * @prop {string} flag Relative URL of the nation's flag image file.
 */
/**
 * Represents a trading card in the NationStates multiverse, holding all the
 * data requested from the Cards API.
 * @typedef {object} Card
 * @prop {number} id Card ID; corresponds to the depicted nation's `dbID`.
 * @prop {number} season ID of the season the card was inscribed for.
 * @prop {CardNation} [depicted] Details of the nation depicted on the card.
 * @prop {string} [rarity] The card's {@link Rarity}.
 * @prop {number} [value] Market value of the card, calculated by the game.
 * @prop {string[]} [owners] Names of nations owning a copy of the card
 *     (`id_form`). The number of times a nation appears corresponds to the
 *     number of copies that nation owns.
 * @prop {Market.Market[]} [asksBids] Extant Asks and Bids ("Markets").
 * @prop {TradeCardbound.TradeCardbound[]} [trades] Transfers of the card that
 *     matched the query filter.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<Card>} A new `Card` factory
 */
exports.create = root => new NSFactory()
	.onTag('CARDID', me => me
		.build('id', convertNumber))
	.onTag('CATEGORY', me => me
		.build('rarity'))
	.onTag('FLAG', me => me
		.build('depicted.flag'))
	.onTag('GOVT', me => me
		.build('depicted.category'))
	.onTag('MARKET_VALUE', me => me
		.build('value', convertNumber))
	.onTag('NAME', me => me
		.build('depicted.name'))
	.onTag('OWNERS', me => me
		.build('owners')
		.assignSubFactory(ArrayFactory.default('OWNER', me => me
			.build(''))))
	.onTag('REGION', me => me
		.build('depicted.region'))
	.onTag('SEASON', me => me
		.build('season', convertNumber))
	.onTag('SLOGAN', me => me
		.build('depicted.motto'))
	.onTag('TYPE', me => me
		.build('depicted.pretitle'))
	.onTag('MARKETS', me => me
		.build('asksBids')
		.assignSubFactory(ArrayFactory.default('MARKET', (me, attrs) => me
			.build('')
			.assignSubFactory(Market.create(attrs)))))
	.onTag('TRADES', me => me
		.build('trades')
		.assignSubFactory(ArrayFactory.default('TRADE', (me, attrs) => me
			.build('')
			.assignSubFactory(TradeCardbound.create(attrs)))));
