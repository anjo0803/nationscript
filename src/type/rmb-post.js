/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { RMBPostStatus } = require('../enums');
const {
	NSFactory,
	convertNumber,
	convertArray
} = require('../factory');

/**
 * Represents a message post lodged to a region's Regional Message Board.
 * @typedef {object} RMBPost
 * @prop {number} id Post ID.
 * @prop {string} nation Nation that made the post (`id_form`).
 * @prop {string} text Body text of the post.
 * @prop {number} likes Number of likes on the post.
 * @prop {string[]} likers Nations that liked the post (`id_form`).
 * @prop {number} timestamp Timestamp of when the post was made.
 * @prop {number} status {@link RMBPostStatus} of the post.
 * @prop {string} [suppressor] Nation that suppressed the post, if applicable.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<RMBPost>} A new `RMBPost` factory
 */
exports.create = (root) => new NSFactory()
	.set('id', root['id'], convertNumber)
	.onTag('NATION', (me) => me
		.build('nation'))
	.onTag('MESSAGE', (me) => me
		.build('text'))
	.onTag('LIKES', (me) => me
		.build('likes', convertNumber))
	.onTag('LIKERS', (me) => me
		.build('likers', convertArray(':')))
	.onTag('TIMESTAMP', (me) => me
		.build('timestamp', convertNumber))
	.onTag('STATUS', (me) => me
		.build('status', convertNumber))
	.onTag('SUPPRESSOR', (me) => me
		.build('suppressor'))

	// <LIKERS> is not returned by the API if the post has no likes
	.set('likers', []);
