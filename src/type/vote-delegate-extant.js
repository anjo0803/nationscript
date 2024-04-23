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
 * Represents an *extant* vote cast by a WA delegate on an at-vote resolution.
 * @typedef {object} DelegateActiveVote
 * @prop {string} delegate Name of the delegate (`id_form`).
 * @prop {number} weight Number of votes the delegate currently has.
 * @prop {number} timestamp Timestamp of when the vote was cast.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<DelegateActiveVote>} A new `DelegateActiveVote` factory
 */
exports.create = root => new NSFactory()
	.onTag('NATION', me => me
		.build('delegate'))
	.onTag('VOTES', me => me
		.build('weight', convertNumber))
	.onTag('TIMESTAMP', me => me
		.build('timestamp', convertNumber));
