const { Rarity } = require('../enums');
const {
	num,
	txt
} = require('../requests/converter');

/**
 * Represents a card with only the most basic data present, as when displayed as part of a listing
 * of multiple cards.
 * @typedef {object} ListCard
 * @prop {number} id ID of the card; equal to the database ID of the nation that is depicted on it.
 * @prop {string} rarity {@linkcode Rarity} of the card.
 * @prop {number} season ID of the season that the card was inscribed for.
 */
/**
 * Builds a card-overview object from the provided parsed response XML.
 * @param {object} c The root object - a `<CARD>` tag in the parsed XML object.
 * @returns {ListCard} The built card-overview object.
 */
exports.parseCardItem = (c) => {
	return {
		id:		num(c, 'CARDID'),
		rarity:	txt(c, 'CATEGORY'),
		season:	num(c, 'SEASON')
	}
}
