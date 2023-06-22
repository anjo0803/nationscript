const {
	num,
	txt
} = require('../requests/converter');

/**
 * Represents a nation's deck of trading cards.
 * @typedef {object} Deck
 * @prop {number} nationID Database ID of the nation that owns the deck.
 * @prop {string} nationName Name of the nation that owns the deck.
 * @prop {number} bank Amount of bank the deck owner currently has.
 * @prop {number} capacity Maximum number of cards that may be in the deck concurrently.
 * @prop {number} numCards Total number of cards currently in the deck.
 * @prop {number} value Aggregate market value of all cards currently in the deck.
 * @prop {number} valueTime Unix epoch timestamp of when the deck's value was last assessed.
 * @prop {number} rank World-wide rank of the deck according to its value.
 * @prop {number} rankRegion Region-wide rank of the deck according to its value.
 * @prop {number} lastPack Unix epoch timestamp of when the deck owner last opened a card pack.
 */
/**
 * Builds a deck object from the provided parsed response XML.
 * @param {object} deck The root object - the `<INFO>` tag in the parsed XML object.
 * @returns {Deck} The built deck object.
 */
exports.parseDeckSummary = (deck) => {
	return {
		nationID:	num(deck, 'ID'),
		nationName:	txt(deck, 'NAME'),
		bank:		num(deck, 'BANK'),
		capacity:	num(deck, 'DECK_CAPACITY_RAW'),
		numCards:	num(deck, 'NUM_CARDS'),
		value:		num(deck, 'DECK_VALUE'),
		valueTime:	num(deck, 'LAST_VALUED'),
		rank:		num(deck, 'RANK'),
		rankRegion:	num(deck, 'REGION_RANK'),
		lastPack:	num(deck, 'LAST_PACK_OPENED')
	}
}
