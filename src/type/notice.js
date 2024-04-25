/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { NoticeType } = require('../enums');
const {
	NSFactory,
	convertNumber,
	convertBoolean
} = require('../factory');

/**
 * Represents a notice alert generated for a nation.
 * @typedef {object} Notice
 * @prop {string} title Notice title.
 * @prop {string} text Notice description.
 * @prop {number} time Timestamp of notice generation.
 * @prop {string} type {@link NoticeType} of the notice.
 * @prop {string} icon Type of the icon shown for the notice.
 * @prop {string} url URL to open when the notice is clicked.
 * @prop {string} who Nation who caused the notice to be generated (`id_form`).
 * @prop {boolean} isNew `true` if viewed before, otherwise `false`.
 * @prop {boolean} ok No idea.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<Notice>} A new `Notice` factory
 */
exports.create = (root) => new NSFactory()
	.onTag('TITLE', (me) => me
		.build('title'))
	.onTag('TEXT', (me) => me
		.build('text'))
	.onTag('TIMESTAMP', (me) => me
		.build('time', convertNumber))
	.onTag('TYPE', (me) => me
		.build('type'))
	.onTag('TYPE_ICON', (me) => me
		.build('icon'))
	.onTag('URL', (me) => me
		.build('url'))
	.onTag('WHO', (me) => me
		.build('who'))
	.onTag('NEW', (me) => me
		.build('isNew', convertBoolean))
	.onTag('OK', (me) => me
		.build('ok', convertBoolean));
