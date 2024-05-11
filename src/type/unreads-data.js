/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	convertNumber
} = require('../factory');
const types = require('../types');

/**
 * @type {import('../factory').FactoryConstructor<types.UnreadsData>}
 * @ignore
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
