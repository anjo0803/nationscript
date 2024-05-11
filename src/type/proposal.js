/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	convertNumber,
	convertArray
} = require('../factory');
const types = require('../types');

const LegalityData = require('./legality-data');

/**
 * @type {import('../factory').FactoryConstructor<types.Proposal>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.set('id', root['id'])
	.onTag('NAME', (me) => me
		.build('title'))
	.onTag('PROPOSED_BY', (me) => me
		.build('author'))
	.onTag('COAUTHOR', (me) => me
		.build('coauthors', convertArray(',')))
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
	})

	// Likewise, if there are no co-authors, there is no <COAUTHOR> tag
	.set('coauthors', []);
