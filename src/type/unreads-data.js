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
 * Container object for data on a nation's number of unread issues, telegrams,
 * notices, and RMB and News posts, as well as the number of at-vote WA
 * resolutions it has not yet cast its vote on.
 * @typedef {object} UnreadsData
 * @prop {number} issue Number of pending issues.
 * @prop {number} telegram Number of unread telegrams.
 * @prop {number} notice Number of unread notices.
 * @prop {number} rmb Number of unread posts on the RMB of the nation's region.
 * @prop {number} wa Number of WA resolutions the nation has not yet voted on.
 * @prop {number} news Number of unread news page posts.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<UnreadsData>} A new `UnreadsData` factory
 */
exports.create = (root) => new NSFactory()
	.onTag('ISSUES', (me) => me
		.build('issue', convertNumber))
	.onTag('TELEGRAMS', (me) => me
		.build('telegram', convertNumber))
	.onTag('NOTICES', (me) => me
		.build('notice', convertNumber))
	.onTag('RMB', (me) => me
		.build('rmb', convertNumber))
	.onTag('WA', (me) => me
		.build('wa', convertNumber))
	.onTag('NEWS', (me) => me
		.build('news', convertNumber));
