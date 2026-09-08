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
 * @type {import('../factory').FactoryConstructor<types.NDayStats>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.onTag('INTERCEPTS', (me) => me
		.build('intercepts', convertNumber))
	.onTag('NUKES', (me) => me
		.build('nukes', convertNumber))
	.onTag('PRODUCTION', (me) => me
		.build('production', convertNumber))
	.onTag('RADIATION', (me) => me
		.build('radiation', convertNumber))
	.onTag('SHIELD', (me) => me
		.build('shields', convertNumber))
	.onTag('SPECIALTY', (me) => me
		.build('founded'))
	.onTag('STRIKES', (me) => me
		.build('founded', convertNumber));
