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
 * Represents a collection of cards with only the most basic data present, as
 * when displayed as part of a listing of multiple collections.
 * @typedef {object} ListCollection
 * @prop {number} id ID of the collection.
 * @prop {string} name Name of the collection.
 * @prop {number} edited Timestamp of the last change to the collection.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<ListCollection>} A new `ListCollection` factory
 */
exports.create = root => new NSFactory()
	.onTag('COLLECTIONID', me => me
		.build('id', convertNumber))
	.onTag('NAME', me => me
		.build('name'))
	.onTag('LAST_UPDATED', me => me
		.build('edited', convertNumber));
