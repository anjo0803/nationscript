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
 * Represents the transfer of a card from one nation to another (whether by
 * gift or auction) from the view of a specific card's details page.
 * @typedef {object} TradeCardbound
 * @prop {string} buyer Nation that received the card (`id_form`).
 * @prop {string} seller Nation that gave the card (`id_form`).
 * @prop {number} price Amount of bank the receiver paid; `0.0` for gifts.
 * @prop {number} timestamp Timestamp of when the transfer occurred.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<TradeCardbound>} A new `TradeCardbound` factory
 */
exports.create = root => new NSFactory()
	.onTag('BUYER', me => me
		.build('buyer'))
	.onTag('SELLER', me => me
		.build('seller'))
	.onTag('PRICE', me => me
		.build('price', val => val ? convertNumber(val) : 0.0))
	.onTag('TIMESTAMP', me => me
		.build('timestamp', convertNumber));
