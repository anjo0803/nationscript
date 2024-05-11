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
 * @type {import('../factory').FactoryConstructor<types.RankChange>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.set('scale', root['id'], convertNumber)
	.onTag('CHANGE', (me) => me
		.build('changeAbsolute', convertNumber))
	.onTag('PCHANGE', (me) => me
		.build('changePercent', convertNumber))
	.onTag('SCORE', (me) => me
		.build('newScore', convertNumber));
