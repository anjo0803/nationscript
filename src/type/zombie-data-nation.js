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

/**
 * Container object for data on a nation's Z-Day performance.
 * @typedef {object} ZombieDataNation
 * @prop {string} intended {@link ZombieAction} the nation selected.
 * @prop {string} action {@link ZombieAction} the nation is actually executing.
 * @prop {number} survivors Millions of citizens alive and well.
 * @prop {number} zombies Millions of zombified citizens.
 * @prop {number} dead Millions of deceased citizens.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<ZombieDataNation>} A new `ZombieDataNation` factory
 */
exports.create = root => new NSFactory()
	.onTag('ZACTION', me => me
		.build('action', val => val || ZombieAction.INACTION))
	.onTag('ZACTIONINTENDED', me => me
		.build('intended', val => val || ZombieAction.INACTION))
	.onTag('SURVIVORS', me => me
		.build('survivors', convertNumber))
	.onTag('ZOMBIES', me => me
		.build('zombies', convertNumber))
	.onTag('DEAD', me => me
		.build('dead', convertNumber));
