/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	convertNumber
} = require('../factory');

/**
 * Container object for data on the Z-Day performance of a region's residents.
 * @typedef {object} ZombieDataRegion
 * @prop {number} survivors Millions of national citizens alive and well.
 * @prop {number} zombies Millions of zombified national citizens.
 * @prop {number} dead Millions of deceased national citizens.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<ZombieDataRegion>} A new `ZombieDataRegion` factory
 */
exports.create = root => new NSFactory()
	.onTag('SURVIVORS', me => me
		.build('survivors', convertNumber))
	.onTag('ZOMBIES', me => me
		.build('zombies', convertNumber))
	.onTag('DEAD', me => me
		.build('dead', convertNumber));
