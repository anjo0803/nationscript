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
const DelegateActiveVote = require('./vote-delegate-extant');
const DelegateLogVote = require('./vote-delegate-log');

/**
 * Container for ordering vote data by votes For and Against.
 * @typedef {{for: Type, against: Type}} ForAgainst
 * @template {any} Type
 */
/**
 * Container object holding data on the state of voting a resolution.
 * @typedef {object} VoteSummary
 * @prop {ForAgainst<number>} total Vote totals.
 * @prop {ForAgainst<number[]>} [track] Progression of vote totals, array
 *     entries representing the respective vote total in hourly intervals.
 * @prop {ForAgainst<string[]>} [nations] Names of individual voters.
 * @prop {ForAgainst<number>} [nationsNum] Numbers of individual voters.
 * @prop {ForAgainst<DelegateActiveVote.DelegateActiveVote>} [delegates] The
 *     details of regional delegates' standing votes.
 * @prop {DelegateLogVote.DelegateLogVote[]} [delegatesLog] Historical log of
 *     regional delegates casting their votes.
 */
/**
 * Represents an at-vote or passed resolution in the World Assembly.
 * @typedef {object} Resolution
 * @prop {string} id Council-internal resolution ID. If the resolution has not
 *     been passed yet, this is its proposal ID.
 * @prop {string} title Resolution title.
 * @prop {string} author Nation that submitted the resolution (`id_form`).
 * @prop {string[]} coauthors List of co-authoring nations (`id_form`).
 * @prop {string} text Body text of the resolution.
 * @prop {number} submitted Timestamp of the resolution's submission.
 * @prop {number} promoted Timestamp of when voting started on the resolution.
 * @prop {number} [implemented] Timestamp of the resolution's passage, if
 *     applicable.
 * @prop {number} [repealed] ID of the resolution this resolution was repealed
 *     by, if applicable.
 * @prop {string} category {@link WACategory} of the resolution.
 * @prop {string} option For GA resolutions and SC declarations, the
 *     subcategory of the resolution; otherwise its target nation or region
 *     (`id_form`).
 * @prop {VoteSummary} [vote] Data on the current votes on the resolution.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<Resolution>} A new `Trade` factory
 */
exports.create = root => new NSFactory()
	.onTag('ID', me => me
		.build('id'))
	.onTag('COUNCILID', me => me
		.build('id'))
	.onTag('NAME', me => me
		.build('title'))
	.onTag('PROPOSED_BY', me => me
		.build('author'))
	.onTag('COAUTHOR', me => me
		.build('coauthors'))	// TODO structure
	.onTag('DESC', me => me
		.build('text'))
	.onTag('CREATED', me => me
		.build('submitted', convertNumber))
	.onTag('PROMOTED', me => me
		.build('promoted', convertNumber))
	.onTag('IMPLEMENTED', me => me
		.build('implemented', convertNumber))
	.onTag('REPEALED_BY', me => me
		.build('repealed', convertNumber))
	.onTag('CATEGORY', me => me
		.build('category'))
	.onTag('OPTION', me => me
		.build('option'))
	.onTag('TOTAL_VOTES_AGAINST', me => me
		.build('vote.total.against', convertNumber))
	.onTag('TOTAL_VOTES_FOR', me => me
		.build('vote.total.for', convertNumber))

	// Only displayed while at-vote
	.onTag('TOTAL_NATIONS_AGAINST', me => me
		.build('vote.nationsNum.against', convertNumber))
	.onTag('TOTAL_NATIONS_FOR', me => me
		.build('vote.nationsNum.for', convertNumber))

	// votetrack shard
	.onTag('VOTE_TRACK_AGAINST', me => me
		.build('vote.track.against')
		.assignSubFactory(ArrayFactory.default('N', me => me
			.build('', convertNumber))))
	.onTag('VOTE_TRACK_FOR', me => me
		.build('vote.track.for')
		.assignSubFactory(ArrayFactory.default('N', me => me
			.build('', convertNumber))))

	// voters shard
	.onTag('VOTES_AGAINST', me => me
		.build('votes.nations.against')
		.assignSubFactory(ArrayFactory.default('N', me => me
			.build(''))))
	.onTag('VOTES_FOR', me => me
		.build('votes.nations.for')
		.assignSubFactory(ArrayFactory.default('N', me => me
			.build(''))))

	// delvotes shard
	.onTag('DELVOTES_AGAINST', me => me
		.build('vote.delegates.against')
		.assignSubFactory(ArrayFactory.default('DELEGATE', (me, attrs) => me
			.build('')
			.assignSubFactory(DelegateActiveVote.create(attrs)))))
	.onTag('DELVOTES_FOR', me => me
		.build('vote.delegates.for')
		.assignSubFactory(ArrayFactory.default('DELEGATE', (me, attrs) => me
			.build('')
			.assignSubFactory(DelegateActiveVote.create(attrs)))))

	// dellog shard
	.onTag('DELLOG', (me, attrs) => me
		.build('vote.delegatesLog')
		.assignSubFactory(ArrayFactory.default('ENTRY', (me, attrs) => me
			.build('')
			.assignSubFactory(DelegateLogVote.create(attrs)))));
