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
 * Represents an ask or bid on a card in the auction house.
 * @typedef {object} Market
 * @prop {string} nation Nation entertaining this market (`id_form`).
 * @prop {number} bank Amount of bank this market is worth.
 * @prop {boolean} isAsk `true` if the market is an Ask, `false` if it's a Bid.
 * @prop {number} timestamp Timestamp of when this market was created.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<Market>} A new `Market` factory
 */
exports.create = (root) => new NSFactory()
	.onTag('NATION', (me) => me
		.build('nation'))
	.onTag('PRICE', (me) => me
		.build('bank', convertNumber))
	.onTag('TYPE', (me) => me
		.build('isAsk', val => val === 'ask'))
	.onTag('TIMESTAMP', (me) => me
		.build('timestamp', convertNumber));
