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
 * Container object holding numerical data on a nation's civil, economic, and
 * political freedoms, all rounded to the nearest integer value.
 * @typedef {object} FreedomsScoreData
 * @prop {string} civil The nation's civil rights score.
 * @prop {string} economic The nation's economical freedom score.
 * @prop {string} political The nation's political freedom score.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<FreedomsScoreData>} A new `FreedomsScoreData` factory
 */
exports.create = (root) => new NSFactory()
	.onTag('CIVILRIGHTS', (me) => me
		.build('civil', convertNumber))
	.onTag('ECONOMY', (me) => me
		.build('economic', convertNumber))
	.onTag('POLITICALFREEDOM', (me) => me
		.build('political', convertNumber));
