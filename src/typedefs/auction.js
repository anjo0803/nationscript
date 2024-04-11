/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { Rarity } = require('../enums');
const {
	num,
	txt
} = require('../requests/converter');

/**
 * Represents an ongoing auction on a card.
 * @typedef {object} Auction
 * @prop {number} id ID of the card being auctioned.
 * @prop {string} rarity {@linkcode Rarity} of the card being auctioned.
 * @prop {string} nation Name of the nation depicted on the card that is being auctioned.
 * @prop {number} season ID of the season the card that is being auctioned was inscribed for.
 */
/**
 * Builds an auction object from the provided parsed response XML.
 * @param {object} auction The root object - an `<AUCTION>` tag in the parsed XML object.
 * @returns {Auction} The built auction object.
 * @ignore
 */
exports.parseAuction = (auction) => {
	return {
		id:		num(auction, 'CARDID'),
		rarity:	txt(auction, 'CATEGORY'),
		nation:	txt(auction, 'NAME'),
		season:	num(auction, 'SEASON')
	}
}
