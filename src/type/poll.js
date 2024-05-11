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
const types = require('../types');

const PollOption = require('./poll-option');

/**
 * @type {import('../factory').FactoryConstructor<types.Poll>}
 * @ignore
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
