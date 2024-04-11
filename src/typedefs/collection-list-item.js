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
 * Represents a collection of cards with only the most basic data present, as when displayed as
 * part of a listing of multiple collections.
 * @typedef {object} ListCollection
 * @prop {number} id ID of the collection.
 * @prop {string} name Name of the collection.
 * @prop {number} edited Unix epoch timestamp of when the last change was made to the collection.
 */
/**
 * Builds a collection-overview object from the provided parsed response XML.
 * @param {object} c The root object - a `<COLLECTION>` tag in the parsed XML object.
 * @returns {ListCollection} The built collection-overview object.
 * @ignore
 */
exports.parseCollectionOverview = (c) => {
	return {
		id:		num(c, 'COLLECTIONID'),
		name:	txt(c, 'NAME'),
		edited:	num(c, 'LAST_UPDATED')
	}
}
