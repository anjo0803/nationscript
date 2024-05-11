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
 * @type {import('../factory').FactoryConstructor<types.TGQueue>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.onTag('MANUAL', (me) => me
		.build('manual', convertNumber))
	.onTag('MASS', (me) => me
		.build('mass', convertNumber))
	.onTag('API', (me) => me
		.build('api', convertNumber));
