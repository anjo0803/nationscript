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
 * Represents a happening event in the NationStates world.
 * @typedef {object} Happening
 * @prop {number} timestamp Timestamp of when the happening occurred.
 * @prop {string} text Description of what transpired in the happening.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<Happening>} A new `Happening` factory
 */
exports.create = root => new NSFactory()
	.onTag('TIMESTAMP', me => me
		.build('timestamp', convertNumber))
	.onTag('TEXT', me => me
		.build('text'));
