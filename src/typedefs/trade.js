const {
	num,
	txt
} = require('../requests/converter');
const { parseCardItem } = require('./card-list-item');

/**
 * Represents the transfer of a card from one nation to another, whether by gift or auction.
 * This type of trade object is used for trade lists on the open market.
 * @typedef {object} Trade
 * @prop {ListCard} card The card transferred.
 * @prop {string} buyer Name of the nation that received the card.
 * @prop {string} seller Name of the nation that gave the card.
 * @prop {(number | null)} price Amount of bank the buyer paid; `null` for gifts.
 * @prop {number} timestamp Unix epoch timestamp of when the transfer occurred.
 */
/**
 * Builds a trade object from the provided parsed response XML.
 * @param {object} trade The root object - a `<TRADE>` tag in the parsed XML object.
 * @returns {Trade} The built trade object.
 * @ignore
 */
exports.parseTrade = (trade) => {
	return {
		card:		parseCardItem(trade),
		buyer:		txt(trade, 'BUYER'),
		seller:		txt(trade, 'SELLER'),
		price:		num(trade, 'PRICE') ?? null,
		timestamp:	num(trade, 'TIMESTAMP')
	}
}
