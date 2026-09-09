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
 * @type {import('../factory').FactoryConstructor<types.WAOpinion>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.onTag('DISPATCHID', (me) => me
		.build('id', convertNumber))
	.onTag('STANCE', (me) => me
		.build('stance'))
