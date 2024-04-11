/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	num,
	txt
} = require('../requests/converter');

/**
 * Represents the transfer of a card from one nation to another, whether by gift or auction.
 * This type of trade object is used for trade lists from a specific card's page.
 * @typedef {object} TradeCardbound
 * @prop {string} buyer Name of the nation that received the card.
 * @prop {string} seller Name of the nation that gave the card.
 * @prop {(number | null)} price Amount of bank the buyer paid; `null` for gifts.
 * @prop {number} timestamp Unix epoch timestamp of when the transfer occurred.
 */
/**
 * Builds a trade object from the provided parsed response XML.
 * @param {object} trade The root object - a `<TRADE>` tag in the parsed XML object.
 * @returns {TradeCardbound} The built trade object.
 * @ignore
 */
exports.parseTradeCardbound = (trade) => {
	return {
		buyer:		txt(trade, 'BUYER'),
		seller:		txt(trade, 'SELLER'),
		price:		num(trade, 'PRICE') ?? null,
		timestamp:	num(trade, 'TIMESTAMP')
	};
}
