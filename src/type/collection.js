/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	ArrayFactory,
	convertNumber
} = require('../factory');
const ListCard = require('./card-list-item');

/**
 * Represents a collection of cards, in detailed form.
 * @typedef {object} Collection
 * @prop {string} name Name of the collection.
 * @prop {string} owner Nation that created the collection (`id_form`).
 * @prop {number} edited Timestamp of the last change to the collection.
 * @prop {ListCard.ListCard[]} cards List of cards in the collection.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<Collection>} A new `Collection` factory
 */
exports.create = (root) => new NSFactory()
	.onTag('NAME', (me) => me
		.build('name'))
	.onTag('NATION', (me) => me
		.build('owner'))
	.onTag('UPDATED', (me) => me
		.build('edited', convertNumber))
	.onTag('DECK', (me) => me
		.build('cards')
		.assignSubFactory(ArrayFactory
			.complex('CARD', ListCard.create)));
