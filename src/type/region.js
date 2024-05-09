/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	ArrayFactory,
	convertNumber,
	convertBoolean,
	convertArray
} = require('../factory');
const types = require('../types');

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

/**
 * @type {import('../factory').DataConverter}
 * @ignore
 */
const toNullIfZero = val => val === '0' ? null : val;

/**
 * @type {import('../factory').FactoryConstructor<types.Region>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.onTag('BANNED', (me) => me
		.build('banlist', convertArray(':')))
	.onTag('BANNER', (me) => me
		.build('bannerID', toNullIfZero))
	.onTag('BANNERBY', (me) => me
		.build('bannerCreator'))
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
		.build('founded', val => val === '0' ? 'Antiquity' : val))
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
		.assignSubFactory(Poll.create(attrs)))
	.onTag('SCVOTE', (me, attrs) => me
		.build('voteSC')
		.assignSubFactory(VoteTally.create(attrs)))
	.onTag('WABADGES', (me) => me
		.build('badges')
		.assignSubFactory(ArrayFactory
			.complex('WABADGE', WABadge.create)))
	.onTag('ZOMBIE', (me, attrs) => me
		.build('zombie')
		.assignSubFactory(ZombieDataRegion.create(attrs)));
