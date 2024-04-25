/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { WACategory } = require('../enums');
const {
	NSFactory,
	convertNumber,
	convertArray
} = require('../factory');
const LegalityData = require('./legality-data');

/**
 * Represents a proposal for a new resolution currently before the delegates of
 * the World Assembly.
 * @typedef {object} Proposal
 * @prop {string} id Proposal ID.
 * @prop {string} title Proposal title.
 * @prop {string} author Nation that submitted the proposal (`id_form`).
 * @prop {string[]} coauthors List of co-authoring nations (`id_form`).
 * @prop {string} text Body text of the proposal.
 * @prop {string[]} approvals WA delegates approving the proposal (`id_form`).
 * @prop {number} submitted Timestamp of proposal submission.
 * @prop {string} category {@link WACategory} of the resolution.
 * @prop {string} option For GA resolutions and SC declarations, the
 *     subcategory of the resolution; otherwise its target nation or region
 *     (`id_form`).
 * @prop {LegalityData} legality Rulings on the proposal's legality.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<Proposal>} A new `Proposal` factory
 */
exports.create = (root) => new NSFactory()
	.set('id', root['id'], convertNumber)
	.onTag('NAME', (me) => me
		.build('title'))
	.onTag('PROPOSED_BY', (me) => me
		.build('author'))
	.onTag('COAUTHORS', (me) => me
		.build(''))	// TODO tag names? or split by char?
	.onTag('DESC', (me) => me
		.build('text'))
	.onTag('APPROVALS', (me) => me
		.build('approvals', convertArray(':')))
	.onTag('CREATED', (me) => me
		.build('submitted', convertNumber))
	.onTag('CATEGORY', (me) => me
		.build('category'))
	.onTag('OPTION', (me) => me
		.build('option'))
	.onTag('GENSEC', (me, attrs) => me
		.build('legality')
		.assignSubFactory(LegalityData.create(attrs)))

	// <GENSEC> isn't returned by the API if there was no legality ruling yet
	.set('legality', {
		legal: [],
		illegal: [],
		discard: [],
		log: []
	});
