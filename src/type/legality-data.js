/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	ArrayFactory
} = require('../factory');
const LegalityDecision = require('./legality-decision');

/**
 * Container object holding data on a proposal's current legal status - that
 * is, the decisions of Moderators or members of the GA General Secretariat on
 * the proposal's compliance with the SC/GA ruleset.
 * @typedef {object} LegalityData
 * @prop {string[]} legal Nations ruling the proposal legal (`id_form`).
 * @prop {string[]} illegal Nations ruling the proposal illegal (`id_form`).
 * @prop {string[]} discard Nations voting to discard the proposal (`id_form`).
 * @prop {LegalityDecision.LegalityDecision[]} log Log of rulings made on the
 *     proposal.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<LegalityData>} A new `LegalityData` factory
 */
exports.create = root => new NSFactory()
	.onTag('DISCARD', me => me
		.build('discard')
		.assignSubFactory(ArrayFactory.default('DISCARD', me => me.build(''))))
	.onTag('ILLEGAL', me => me
		.build('illegal')
		.assignSubFactory(ArrayFactory.default('ILLEGAL', me => me.build(''))))
	.onTag('LEGAL', me => me
		.build('legal')
		.assignSubFactory(ArrayFactory.default('LEGAL', me => me.build(''))))
	.onTag('LOG', me => me
		.build('log')
		.assignSubFactory(ArrayFactory.default('ENTRY', (me, attrs) => me
			.build('')
			.assignSubFactory(LegalityDecision.create(attrs)))));
