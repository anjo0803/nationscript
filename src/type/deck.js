/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	convertNumber
} = require('../factory');

/**
 * Represents a nation's deck of trading cards.
 * @typedef {object} Deck
 * @prop {number} nationID Database ID of the nation that owns the deck.
 * @prop {string} nationName Name of the nation that owns the deck (`id_form`).
 * @prop {number} bank Amount of bank the deck owner currently has.
 * @prop {number} capacity Maximum number of cards that may be in the deck.
 * @prop {number} numCards Number of cards currently in the deck.
 * @prop {number} value Total market value of all cards currently in the deck.
 * @prop {number} valueTime Timestamp of when the deck's value was assessed.
 * @prop {number} rank World-wide rank of the deck according to value.
 * @prop {number} rankRegion Region-wide rank of the deck according to value.
 * @prop {number} lastPack Timestamp of when the deck owner last opened a pack
 *     of cards.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<Deck>} A new `Deck` factory
 */
exports.create = root => new NSFactory()
	.onTag('ID', me => me
		.build('nationID', convertNumber))
	.onTag('NAME', me => me
		.build('nationName'))
	.onTag('BANK', me => me
		.build('bank', convertNumber))
	.onTag('DECK_CAPACITY_RAW', me => me
		.build('capacity', convertNumber))
	.onTag('NUM_CARDS', me => me
		.build('numCards', convertNumber))
	.onTag('DECK_VALUE', me => me
		.build('value', convertNumber))
	.onTag('LAST_VALUED', me => me
		.build('valueTime', convertNumber))
	.onTag('RANK', me => me
		.build('rank', convertNumber))
	.onTag('REGION_RANK', me => me
		.build('rankRegion', convertNumber))
	.onTag('LAST_PACK_OPENED', me => me
		.build('lastPack', convertNumber));
