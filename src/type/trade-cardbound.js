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
 * @type {import('../factory').FactoryConstructor<types.TradeCardbound>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.onTag('BUYER', (me) => me
		.build('buyer'))
	.onTag('SELLER', (me) => me
		.build('seller'))
	.onTag('PRICE', (me) => me
		.build('price', val => val ? convertNumber(val) : 0.0))
	.onTag('TIMESTAMP', (me) => me
		.build('timestamp', convertNumber));
