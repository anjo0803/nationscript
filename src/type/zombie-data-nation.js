/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { ZombieAction } = require('../enums');
const {
	NSFactory,
	convertNumber
} = require('../factory');
const types = require('../types');

/**
 * @type {import('../factory').FactoryConstructor<types.ZombieDataNation>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.onTag('ZACTION', (me) => me
		.build('action', val => val
			|| ZombieAction.INACTION))	// Tag empty if no activity during ZDay
	.onTag('ZACTIONINTENDED', (me) => me
		.build('intended', val => val
			|| me.get('action')	// Tag is empty if not different than <ZACTION>
			|| ZombieAction.INACTION))
	.onTag('SURVIVORS', (me) => me
		.build('survivors', convertNumber))
	.onTag('ZOMBIES', (me) => me
		.build('zombies', convertNumber))
	.onTag('DEAD', (me) => me
		.build('dead', convertNumber));
