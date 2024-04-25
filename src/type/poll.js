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
const PollOption = require('./poll-option');

/**
 * Represents a regional poll.
 * @typedef {object} Poll
 * @prop {number} id Poll ID.
 * @prop {string} title Poll title.
 * @prop {string} [description] Poll description.
 * @prop {string} author Nation that created the poll (`id_form`).
 * @prop {string} region Region that the poll is running in (`id_form`).
 * @prop {number} opens Timestamp for when the poll opens.
 * @prop {number} closes Timestamp for when the poll closes.
 * @prop {PollOption[]} options The available answer options.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<Poll>} A new `Poll` factory
 */
exports.create = (root) => new NSFactory()
	.set('id', root['id'], convertNumber)
	.onTag('TITLE', (me) => me
		.build('title'))
	.onTag('TEXT', (me) => me
		.build('description'))
	.onTag('AUTHOR', (me) => me
		.build('author'))
	.onTag('REGION', (me) => me
		.build('region'))
	.onTag('START', (me) => me
		.build('opens', convertNumber))
	.onTag('STOP', (me) => me
		.build('closes', convertNumber))
	.onTag('OPTIONS', (me) => me
		.build('options')
		.assignSubFactory(ArrayFactory
			.complex('OPTION', PollOption.create)));
