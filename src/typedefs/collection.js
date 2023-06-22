const {
	handleList,
	num,
	txt
} = require('../requests/converter');
const { parseCardItem } = require('./card-list-item');

/**
 * Represents a collection of cards in detailed form.
 * @typedef {object} Collection
 * @prop {string} name Name of the collection.
 * @prop {string} owner Name of the nation that created the collection.
 * @prop {number} edited Unix epoch timestamp of when the last change was made to the collection.
 * @prop {ListCard[]} cards List of all cards in the collection.
 */
/**
 * Builds a collection object from the provided parsed response XML.
 * @param {object} c The root object - the `<COLLECTION>` tag in the parsed XML object.
 * @returns {Collection} The built collection object.
 */
exports.parseCollection = (c) => {
	return {
		name:	txt(c, 'NAME'),
		owner:	txt(c, 'NATION'),
		edited:	num(c, 'UPDATED'),
		cards:	handleList(c['DECK'], parseCardItem)
	}
}
