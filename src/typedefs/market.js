const {
	num,
	txt
} = require('../requests/converter');

/**
 * Represents an ask or bid on a card in the auction house.
 * @typedef {object} Market
 * @prop {string} nation Name of the nation entertaining this market.
 * @prop {number} bank Amount of bank placed in this market.
 * @prop {('ask' | 'bid')} type Whether this market is an ask or a bid on a card.
 * @prop {number} timestamp Unix epoch timestamp of when this market was created.
 */
/**
 * Builds a market object from the provided parsed response XML.
 * @param {object} market The root object - a `<MARKET>` tag in the parsed XML object.
 * @returns {Market} The built market object.
 */
exports.parseMarket = (market) => {
	return {
		nation:		txt(market, 'NATION'),
		bank:		num(market, 'PRICE'),
		type:		txt(market, 'TYPE'),
		timestamp:	num(market, 'TIMESTAMP')
	}
}
