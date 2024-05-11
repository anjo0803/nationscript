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
 * @type {import('../factory').FactoryConstructor<types.ZombieDataRegion>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.onTag('SURVIVORS', (me) => me
		.build('survivors', convertNumber))
	.onTag('ZOMBIES', (me) => me
		.build('zombies', convertNumber))
	.onTag('DEAD', (me) => me
		.build('dead', convertNumber));
