/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	convertNumber,
	convertArray
} = require('../factory');

/**
 * Represents a voting option on a regional poll.
 * @typedef {object} PollOption
 * @prop {number} id Poll-internal ID of this option.
 * @prop {string} text Text of this option.
 * @prop {number} votes Number of votes for this option.
 * @prop {string[]} voters Nations voting for this option (`id_form`).
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<PollOption>} A new `Auction` factory
 */
exports.create = (root) => new NSFactory()
	.set('id', root['id'], convertNumber)
	.onTag('OPTIONTEXT', (me) => me
		.build('text'))
	.onTag('VOTES', (me) => me
		.build('votes', convertNumber))
	.onTag('VOTERS', (me) => me
		.build('voters', convertArray(':')));
