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
 * @type {import('../factory').FactoryConstructor<types.SectorsData>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.onTag('BLACKMARKET', (me) => me
		.build('blackMarket', convertNumber))
	.onTag('GOVERNMENT', (me) => me
		.build('government', convertNumber))
	.onTag('INDUSTRY', (me) => me
		.build('private', convertNumber))
	.onTag('PUBLIC', (me) => me
		.build('stateOwned', convertNumber));
