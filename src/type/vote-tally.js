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
 * Represents a regional tally of votes For and Against a resolution in the
 * World Assembly.
 * @typedef {object} VoteTally
 * @prop {number} for Number of votes in favor of the resolution.
 * @prop {number} against Number of votes against the resolution.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<VoteTally>} A new `VoteTally` factory
 */
exports.create = root => new NSFactory()
	.onTag('FOR', me => me
		.build('for', convertNumber))
	.onTag('AGAINST', me => me
		.build('against', convertNumber));
