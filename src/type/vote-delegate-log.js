/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	convertNumber
} = require('../factory');
const { WAVote } = require('../enums');

/**
 * Represents a vote *historically* cast by a WA delegate on an at-vote
 * resolution. It may be the current vote, or have been updated since.
 * @typedef {object} DelegateLogVote
 * @prop {string} delegate Name of the delegate (`id_form`).
 * @prop {string} vote {@link WAVote} cast by the delegate.
 * @prop {number} weight Number of votes the delegate currently has.
 * @prop {number} timestamp Timestamp of when the vote was cast.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<DelegateLogVote>} A new `DelegateLogVote` factory
 */
exports.create = root => new NSFactory()
	.onTag('NATION', me => me
		.build('delegate'))
	.onTag('ACTION', me => me
		.build('vote'))
	.onTag('VOTES', me => me
		.build('weight', convertNumber))
	.onTag('TIMESTAMP', me => me
		.build('timestamp', convertNumber));
