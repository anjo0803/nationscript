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
 * @type {import('../factory').FactoryConstructor<types.NewNation>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.set('nation', root['name'])
	.onTag('REGION', (me) => me
		.build('region'))
	.onTag('FOUNDEDTIME', (me) => me
		.build('founded', convertNumber));
