/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { LegalityRuling } = require('../enums');
const {
	NSFactory,
	convertNumber
} = require('../factory');

/**
 * Represents a ruling of a Moderator or a member of the General Secretariat
 * concerning the legality of a concrete {@linkcode Proposal}.
 * @typedef {object} LegalityDecision
 * @prop {string} nation Nation that made the ruling (`id_form`).
 * @prop {string} ruling The {@link LegalityRuling} made.
 * @prop {string} reason Comment attached to the ruling.
 * @prop {number} timestamp Timestamp of when the ruling was made.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<LegalityDecision>} A new `LegalityDecision` factory
 */
exports.create = (root) => new NSFactory()
	.onTag('NATION', (me) => me
		.build('nation'))
	.onTag('DECISION', (me) => me
		.build('ruling'))
	.onTag('REASON', (me) => me
		.build('reason'))
	.onTag('T', (me) => me
		.build('timestamp', convertNumber));
