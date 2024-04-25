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
 * Container object holding data on a nation's aggregate RMB activity.
 * @typedef {object} RMBActivity
 * @prop {string} nation Nation the data is for (`id_form`).
 * @prop {number} score Aggregate score of the nation.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<RMBActivity>} A new `RMBActivity` factory
 */
exports.create = (root) => new NSFactory()
	.onTag('NAME', (me) => me
		.build('nation'))
	// These are mutually exclusive, so they can all target a uniform property
	.onTag('POSTS', (me) => me
		.build('score', convertNumber))
	.onTag('LIKES', (me) => me
		.build('score', convertNumber))
	.onTag('LIKED', (me) => me
		.build('score', convertNumber));
