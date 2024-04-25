/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	DispatchCategory,
	DispatchSubcategory
} = require('../enums');
const {
	NSFactory,
	convertNumber
} = require('../factory');

/**
 * Represents a dispatch.
 * @typedef {object} Dispatch
 * @prop {number} id ID of the dispatch.
 * @prop {string} title The dispatch's title.
 * @prop {string} author Nation that published the dispatch (`id_form`).
 * @prop {string} categoryTop The {@linkcode DispatchCategory} of the dispatch.
 * @prop {string} categorySub The {@linkcode DispatchSubcategory} of the
 *     dispatch.
 * @prop {string} body Body text of the dispatch.
 * @prop {number} posted Timestamp of the dispatch's original publication.
 * @prop {number} edited Timestamp of the last edit to the dispatch. If there
 *     haven't been any edits, `0`.
 * @prop {number} views Number of views on the dispatch.
 * @prop {number} score The dispatch's score - upvotes minus downvotes.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<Dispatch>} A new `Dispatch` factory
 */
exports.create = (root) => new NSFactory()
	.set('id', root['id'], convertNumber)
	.onTag('TITLE', (me) => me
		.build('title'))
	.onTag('AUTHOR', (me) => me
		.build('author'))
	.onTag('CATEGORY', (me) => me
		.build('categoryTop'))
	.onTag('SUBCATEGORY', (me) => me
		.build('categorySub'))
	.onTag('TEXT', (me) => me
		.build('body'))
	.onTag('CREATED', (me) => me
		.build('posted', convertNumber))
	.onTag('EDITED', (me) => me
		.build('edited', convertNumber))
	.onTag('VIEWS', (me) => me
		.build('views', convertNumber))
	.onTag('SCORE', (me) => me
		.build('score', convertNumber));
