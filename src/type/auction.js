/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { Rarity } = require('../enums');
const {
	NSFactory,
	convertNumber
} = require('../factory');

/**
 * Represents an ongoing auction on a card.
 * @typedef {object} Auction
 * @prop {number} id ID of the card being auctioned.
 * @prop {string} rarity {@link Rarity} of the card.
 * @prop {string} nation Nation depicted on the card (`Proper Form`).
 * @prop {number} season ID of the season the card was inscribed for.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<Auction>} A new `Auction` factory
 */
exports.create = root => new NSFactory()
	.onTag('CARDID', me => me
		.build('id', convertNumber))
	.onTag('CATEGORY', me => me
		.build('rarity'))
	.onTag('NAME', me => me
		.build('nation'))
	.onTag('SEASON', me => me
		.build('season', convertNumber));
