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
const types = require('../types');

/**
 * @type {import('../factory').FactoryConstructor<types.Officer>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.onTag('NATION', (me) => me
		.build('nation'))
	.onTag('OFFICE', (me) => me
		.build('office'))
	.onTag('BY', (me) => me
		.build('appointer'))
	.onTag('AUTHORITY', (me) => me
		.build('authorities', convertArray('')))
	.onTag('TIME', (me) => me
		.build('appointment', convertNumber))
	.onTag('ORDER', (me) => me
		.build('order', convertNumber));
