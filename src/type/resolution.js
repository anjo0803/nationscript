/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	ArrayFactory,
	convertNumber
} = require('../factory');
const types = require('../types');

const DelegateActiveVote = require('./vote-delegate-extant');
const DelegateLogVote = require('./vote-delegate-log');


/**
 * @type {import('../factory').FactoryConstructor<types.Resolution>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.onTag('ID', (me) => me
		.build('id'))
	.onTag('RESID', (me) => me
		.build('idOverall', convertNumber))
	.onTag('COUNCILID', (me) => me
		.build('id'))
	.onTag('NAME', (me) => me
		.build('title'))
	.onTag('PROPOSED_BY', (me) => me
		.build('author'))
	.onTag('COAUTHOR', (me) => me
		.build('coauthors')
		.assignSubFactory(ArrayFactory
			.primitive('N')))
	.onTag('DESC', (me) => me
		.build('text'))
	.onTag('CREATED', (me) => me
		.build('submitted', convertNumber))
	.onTag('PROMOTED', (me) => me
		.build('promoted', convertNumber))
	.onTag('IMPLEMENTED', (me) => me
		.build('implemented', convertNumber))
	.onTag('REPEALED_BY', (me) => me
		.build('repealed', convertNumber))
	.onTag('CATEGORY', (me) => me
		.build('category'))
	.onTag('OPTION', (me) => me
		.build('option'))
	.onTag('TOTAL_VOTES_AGAINST', (me) => me
		.build('vote.total.against', convertNumber))
	.onTag('TOTAL_VOTES_FOR', (me) => me
		.build('vote.total.for', convertNumber))

	// Only displayed while at-vote
	.onTag('TOTAL_NATIONS_AGAINST', (me) => me
		.build('vote.nationsNum.against', convertNumber))
	.onTag('TOTAL_NATIONS_FOR', (me) => me
		.build('vote.nationsNum.for', convertNumber))

	// votetrack shard
	.onTag('VOTE_TRACK_AGAINST', (me) => me
		.build('vote.track.against')
		.assignSubFactory(ArrayFactory
			.primitive('N', convertNumber)))
	.onTag('VOTE_TRACK_FOR', (me) => me
		.build('vote.track.for')
		.assignSubFactory(ArrayFactory
			.primitive('N', convertNumber)))

	// voters shard
	.onTag('VOTES_AGAINST', (me) => me
		.build('votes.nations.against')
		.assignSubFactory(ArrayFactory
			.primitive('N')))
	.onTag('VOTES_FOR', (me) => me
		.build('votes.nations.for')
		.assignSubFactory(ArrayFactory
			.primitive('N')))

	// delvotes shard
	.onTag('DELVOTES_AGAINST', (me) => me
		.build('vote.delegates.against')
		.assignSubFactory(ArrayFactory
			.complex('DELEGATE', DelegateActiveVote.create)))
	.onTag('DELVOTES_FOR', (me) => me
		.build('vote.delegates.for')
		.assignSubFactory(ArrayFactory
			.complex('DELEGATE', DelegateActiveVote.create)))

	// dellog shard
	.onTag('DELLOG', (me, attrs) => me
		.build('vote.delegatesLog')
		.assignSubFactory(ArrayFactory
			.complex('ENTRY', DelegateLogVote.create)))

	// If there are no co-authors, the <COAUTHOR> tag isn't returned at all
	.set('coauthors', []);
