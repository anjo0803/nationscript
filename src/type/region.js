/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	CensusScale,
	CrosspostingPolicy,
	OfficerAuthority,
	Tag
} = require('../enums');

const {
	NSFactory,
	ArrayFactory,
	convertNumber,
	convertBoolean,
	convertArray
} = require('../factory');

const WABadge = require('./badge-wa');
const CensusDataRegion = require('./census-data-region');
const CensusRankScored = require('./census-rank-scored');
const Embassy = require('./embassy');
const Happening = require('./happening');
const Officer = require('./officer');
const Poll = require('./poll');
const RMBActivity = require('./rmb-activity');
const RMBPost = require('./rmb-post');
const VoteTally = require('./vote-tally');
const ZombieDataRegion = require('./zombie-data-region');

/** @type {import('../factory').DataConverter} */
const toNullIfZero = val => val === '0' ? null : val;

/**
 * Represents a region in the NationStates multiverse, containing all the data
 * requested from the Region API.
 * @typedef {object} Region
 * @prop {string} idForm Name of this region in `id_form`.
 * @prop {string[]} [banlist] Nations on the region's banlist (`id_form`).
 * @prop {?string} [bannerID] ID of the regional banner. If the region doesn't
 *     fly a custom banner, `null`.
 * @prop {?string} [bannerCreator] Nation that set the regional banner. If the
 *     region doesn't fly a custom banner, `null`.
 * @prop {string} [bannerURL] Relative URL of the regional banner image file.
 * @prop {number} [dbID] Database ID of the region.
 * @prop {number[]} [pinnedDispatches] IDs of dispatches currently pinned to
 *     the region's WFE.
 * @prop {?string} [delegateName] Nation serving as the regional WA Delegate
 *     (`id_form`). If there is no Delegate, `null`.
 * @prop {string[]} [delegateAuthorities] {@link OfficerAuthority} codes for
 *     the office of regional WA Delegate.
 * @prop {number} [delegateVotes] Number of votes the regional WA Delegate has.
 * @prop {string} [crossposting] {@link CrosspostingPolicy} of the region.
 * @prop {string} [wfe] Body text of the region's World Factbook Entry.
 * @prop {string} [flag] Absolute URL of the regional flag image file.
 * @prop {string} [founded] Textual description of when the region was founded,
 *     relative to now.
 * @prop {number} [foundedTimestamp] Timestamp of the region's founding. A
 *     founding in antiquity is represented with `0`.
 * @prop {boolean} [isFrontier] `true` if the region is a frontier, otherwise
 *     `false`.
 * @prop {?string} [governor] Nation serving as the regional governor
 *     (`id_form`). If the region has no governor, `null`.
 * @prop {number} [updateLast] Timestamp of when the region last updated.
 * @prop {number} [updateMajor] Timestamp of when the region last updated in
 *     the course of a Major update.
 * @prop {number} [updateMinor] Timestamp of when the region last updated in
 *     the course of a Minor update.
 * @prop {string} [name] Name of the region (`Proper Form`).
 * @prop {string[]} [nations] Nations residing in the region (`id_form`).
 * @prop {number} [nationsNum] Number of nations residing in the region.
 * @prop {string[]} [nationsWA] Number of WA members residing in the region.
 * @prop {number} [nationsWANum] WA members residing in the region (`id_form`).
 * @prop {string} [powerLevel] Textual description of the total influence among
 *     nations in the region.
 * @prop {string[]} [tags] {@link Tag}s the region has.
 * @prop {CensusDataRegion.CensusDataRegion[]} [census] Performance of the
 *     region on the queried {@link CensusScale}s.
 * @prop {CensusRankScored.CensusRankScored[]} [censusRanks] Resident nations
 *     ranked by their score on the queried {@link CensusScale}.
 * @prop {Embassy.Embassy} [embassies] Embassies the region has with others.
 * @prop {?string} [founder] Nation that founded the region (`id_form`). If
 *     there is no founder, `null`.
 * @prop {VoteTally.VoteTally} [voteGA] Tally of votes For and Against the
 *     at-vote GA resolution by resident WA members.
 * @prop {Happening.Happening[]} [happenings] Recent regional happening events.
 * @prop {Happening.Happening[]} [history] Significant happening events from
 *     the regional history.
 * @prop {RMBPost.RMBPost[]} [messages] RMB posts that matched the RMB post
 *     query.
 * @prop {RMBActivity.RMBActivity[]} [rmbMostPosts] Nations' aggregate posting
 *     activity on the region's RMB, as queried.
 * @prop {RMBActivity.RMBActivity[]} [rmbMostLikesGiven] Nations' aggregate
 *     likes given on the region's RMB, as queried.
 * @prop {RMBActivity.RMBActivity[]} [rmbMostLikesReceived] Nations' aggregate
 *     likes received on the region's RMB, as queried.
 * @prop {Officer.Officer[]} [officers] Regional officers.
 * @prop {Poll.Poll} [poll] Currently active regional poll.
 * @prop {VoteTally.VoteTally} [voteSC] Tally of votes For and Against the
 *     at-vote SC resolution by resident WA members.
 * @prop {WABadge.WABadge[]} [badges] Badges awarded to the region by the SC.
 * @prop {ZombieDataRegion.ZombieDataRegion} [zombie] Details of the regional
 *     Z-Day performance.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<Region>} A new `Region` factory
 */
exports.create = (root) => new NSFactory()
	.onTag('BANNED', (me) => me
		.build('banlist', convertArray(':')))
	.onTag('BANNER', (me) => me
		.build('bannerID', toNullIfZero))
	.onTag('BANNERBY', (me) => me
		.build('bannerCreator'))	// TODO: convert to null if there is no banner
	.onTag('BANNERURL', (me) => me
		.build('bannerURL'))
	.onTag('DBID', (me) => me
		.build('dbID', convertNumber))
	.onTag('DISPATCHES', (me) => me
		.build('pinnedDispatches', val => {
			let ret = [];
			let vals = val?.split?.(',');
			if(val) for(let v of vals) ret.push(convertNumber(v));
			return ret;
		}))
	.onTag('DELEGATE', (me) => me
		.build('delegateName', toNullIfZero))
	.onTag('DELEGATEAUTH', (me) => me
		.build('delegateAuthorities', convertArray('')))
	.onTag('DELEGATEVOTES', (me) => me
		.build('delegateVotes', convertNumber))
	.onTag('EMBASSYRMB', (me) => me
		.build('crossposting'))
	.onTag('FACTBOOK', (me) => me
		.build('wfe', val => val ?? ''))
	.onTag('FLAG', (me) => me
		.build('flag'))
	.onTag('FOUNDED', (me) => me
		.build('founded'))
	.onTag('FOUNDER', (me) => me
		.build('founder', toNullIfZero))
	.onTag('FOUNDEDTIME', (me) => me
		.build('foundedTimestamp', convertNumber))
	.onTag('FRONTIER', (me) => me
		.build('isFrontier', convertBoolean))
	.onTag('GOVERNOR', (me) => me
		.build('governor', toNullIfZero))
	.onTag('LASTUPDATE', (me) => me
		.build('updateLast', convertNumber))
	.onTag('LASTMAJORUPDATE', (me) => me
		.build('updateMajor', convertNumber))
	.onTag('LASTMINORUPDATE', (me) => me
		.build('updateMinor', convertNumber))
	.onTag('NAME', (me) => me
		.build('name'))
	.onTag('NATIONS', (me) => me
		.build('nations', convertArray(':')))
	.onTag('NUMNATIONS', (me) => me
		.build('nationsNum', convertNumber))
	.onTag('UNNATIONS', (me) => me
		.build('nationsWA', convertArray(':')))
	.onTag('NUMUNNATIONS', (me) => me
		.build('nationsWANum', convertNumber))
	.onTag('POWER', (me) => me
		.build('powerLevel'))
	.onTag('TAGS', (me) => me
		.build('tags')
		.assignSubFactory(ArrayFactory
			.primitive('TAG')))
	.onTag('CENSUS', (me, attrs) => me
		.build('census')
		.assignSubFactory(ArrayFactory
			.complex('SCALE', CensusDataRegion.create)))
	.onTag('CENSUSRANKS', (me) => me
		.build('censusRanks')
		// For some reason, the actual data is wrapped in another <NATIONS> tag
		.assignSubFactory(new NSFactory().onTag('NATIONS', (me) => me.build('')
			.assignSubFactory(ArrayFactory
				.complex('NATION', CensusRankScored.create)))))
	.onTag('EMBASSIES', (me) => me
		.build('embassies')
		.assignSubFactory(ArrayFactory
			.complex('EMBASSY', Embassy.create)))
	.onTag('GAVOTE', (me, attrs) => me
		.build('voteGA')
		.assignSubFactory(VoteTally.create(attrs)))
	.onTag('HAPPENINGS', (me) => me
		.build('happenings')
		.assignSubFactory(ArrayFactory
			.complex('EVENT', Happening.create)))
	.onTag('HISTORY', (me) => me
		.build('history')
		.assignSubFactory(ArrayFactory
			.complex('EVENT', Happening.create)))
	.onTag('MESSAGES', (me) => me
		.build('messages')
		.assignSubFactory(ArrayFactory
			.complex('POST', RMBPost.create)))
	.onTag('MOSTPOSTS', (me) => me
		.build('rmbMostPosts')
		.assignSubFactory(ArrayFactory
			.complex('NATION', RMBActivity.create)))
	.onTag('MOSTLIKES', (me) => me
		.build('rmbMostLikesReceived')
		.assignSubFactory(ArrayFactory
			.complex('NATION', RMBActivity.create)))
	.onTag('MOSTLIKED', (me) => me
		.build('rmbMostLikesGiven')
		.assignSubFactory(ArrayFactory
			.complex('NATION', RMBActivity.create)))
	.onTag('OFFICERS', (me) => me
		.build('officers')
		.assignSubFactory(ArrayFactory
			.complex('OFFICER', Officer.create)))
	.onTag('POLL', (me, attrs) => me
		.build('poll')
		.assignSubFactory(Poll.create(attrs)))	// TODO: check API behaviour if there is no poll
	.onTag('SCVOTE', (me, attrs) => me
		.build('voteSC')
		.assignSubFactory(VoteTally.create(attrs)))
	.onTag('WABADGES', (me) => me
		.build('badges')
		.assignSubFactory(ArrayFactory
			.complex('', WABadge.create)))	// TODO tag name
	.onTag('ZOMBIE', (me, attrs) => me
		.build('zombie')
		.assignSubFactory(ZombieDataRegion.create(attrs)));
