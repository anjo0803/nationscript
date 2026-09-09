/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { LegalityRuling } = require('../enums');
const {
	NSFactory,
	convertNumber,
	convertArray,
	convertBoolean,
	ArrayFactory
} = require('../factory');
const types = require('../types');

const LegalityData = require('./legality-data');
const ProposalApproval = require('./proposal-approval');
const WAOpinion = require('./wa-opinion');

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
	.onTag('STATUS', (me) => me	// This is annoyingly in lowercase only instead
		.build('legality.status', (val) => val
			.charAt(0).toUpperCase() + val.slice(1)))
	.onTag('FORUM_TOPIC_URL', (me) => me
		.build('forumURL'))
	.onTag('FORUM_TOPIC_ID', (me) => me
		.build('forumID', convertNumber))
	.onTag('SITE_URL', (me) => me
		.build('siteURL'))
	.onTag('API_URL', (me) => me
		.build('apiURL'))
	.onTag('APPROVAL_COUNT', (me) => me
		.build('approverCount', convertNumber))
	.onTag('QUORUM', (me) => me
		.build('quorum', convertNumber))

	// approvers shard
	.onTag('APPROVERS', (me) => me
		.build('approverHistory')
		.assignSubFactory(ArrayFactory
			.complex('APPROVER', ProposalApproval.create)))

	// opinions shard
	.onTag('OPINIONS', (me) => me
		.build('opinions')
		.assignSubFactory(ArrayFactory
			.complex('OPINION', WAOpinion.create)))

	// <GENSEC> isn't returned by the API if there was no legality ruling yet
	.set('legality', {
		status: LegalityRuling.LEGAL,
		legal: [],
		illegal: [],
		discard: [],
		log: []
	})

	// Likewise, if there are no co-authors, there is no <COAUTHOR> tag
	.set('coauthors', [])

	// Same with the <OPINIONS> tag if there aren't any published yet
	.set('opinions', []);
