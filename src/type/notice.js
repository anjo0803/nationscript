/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	convertNumber,
	convertBoolean
} = require('../factory');
const types = require('../types');

/**
 * @type {import('../factory').FactoryConstructor<types.Notice>}
 * @ignore
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
