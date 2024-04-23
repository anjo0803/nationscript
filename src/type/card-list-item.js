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
 * Represents a card with only the most basic data present, as when displayed
 * as part of a listing of multiple cards.
 * @typedef {object} ListCard
 * @prop {number} id ID of the card (and the depicted nation).
 * @prop {string} rarity {@link Rarity} of the card.
 * @prop {number} season ID of the season that the card was inscribed for.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<ListCard>} A new `ListCard` factory
 */
exports.create = root => new NSFactory()
	.onTag('CARDID', me => me
		.build('id', convertNumber))
	.onTag('SEASON', me => me
		.build('season', convertNumber))
	.onTag('CATEGORY', me => me
		.build('rarity'));
