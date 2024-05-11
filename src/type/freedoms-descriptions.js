/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory
} = require('../factory');
const types = require('../types');

/**
 * @type {import('../factory').FactoryConstructor<types.FreedomsTextData>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.onTag('CIVILRIGHTS', (me) => me
		.build('civil'))
	.onTag('ECONOMY', (me) => me
		.build('economic'))
	.onTag('POLITICALFREEDOM', (me) => me
		.build('political'));
