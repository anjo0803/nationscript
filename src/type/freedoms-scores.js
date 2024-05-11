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
 * @type {import('../factory').FactoryConstructor<types.FreedomsScoreData>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.onTag('CIVILRIGHTS', (me) => me
		.build('civil', convertNumber))
	.onTag('ECONOMY', (me) => me
		.build('economic', convertNumber))
	.onTag('POLITICALFREEDOM', (me) => me
		.build('political', convertNumber));
