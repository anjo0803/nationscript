/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	ArrayFactory,
	convertNumber,
	convertArray
} = require('../factory');
const { WorldShard } = require('../shards');
const types = require('../types');

const Banner = require('./banner');
const CensusRankScored = require('./census-rank-scored');
const CensusDataWorld = require('./census-data-world');
const CensusDescription = require('./census-description');
const Dispatch = require('./dispatch');
const ListDispatch = require('./dispatch-list-item');
const Faction = require('./faction');
const ListFaction = require('./faction-list-item');
const IDHappening = require('./happening-id');
const NewNation = require('./new-nation');
const Poll = require('./poll');
const TGQueue = require('./tg-queue');

/**
 * Since the World API returns regions data and the results of the region tag
 * search both in <REGIONS> tags, parsing their contents into the proper
 * properties requires tracking of the originally requested shards, since in
 * any case the "simple" regions shard is always returned before the tags one.
 * @arg {string[]} shards Shards requested in the original request
 * @returns {import('../factory').FactoryConstructor<types.World>}
 * @ignore
 */
exports.create = (shards = []) => (root) => new NSFactory()
	.onTag('CENSUSID', (me) => me
		.build('censusID', convertNumber))
	.onTag('FEATUREDREGION', (me) => me
		.build('featured'))
	.onTag('LASTEVENTID', (me) => me
		.build('lastEventID', convertNumber))
	.onTag('NATIONS', (me) => me
		.build('nations', convertArray(',')))
	.onTag('NEWNATIONS', (me) => me
		.build('nationsNew', convertArray(',')))
	.onTag('NUMNATIONS', (me) => me
		.build('nationsNum', convertNumber))
	.onTag('NUMREGIONS', (me) => me
		.build('regionsNum', convertNumber))
	.onTag('REGIONS', (me) => {
		if(!shards.includes(WorldShard.REGIONS_BY_TAG)
			|| me.get('regions') === undefined)
				return me.build('regions');
		return me.build('regionsByTag');
	})
	.onTag('BANNERS', (me) => me
		.build('banners')
		.assignSubFactory(ArrayFactory
			.complex('BANNER', Banner.create)))
	.onTag('CENSUS', (me) => me
		.build('censusAverages')
		.assignSubFactory(ArrayFactory
			.complex('SCALE', CensusDataWorld.create)))
	.onTag('CENSUSSCALE', (me) => me
		.build('censusScale'))
	.onTag('CENSUSTITLE', (me) => me
		.build('censusTitle'))
	.onTag('CENSUSDESC', (me, attrs) => me
		.build('censusDescription')
		.assignSubFactory(CensusDescription.create(attrs)))
	.onTag('CENSUSRANKS', (me) => me
		.build('censusRanks')
		// For some reason, the actual data is wrapped in another <NATIONS> tag
		.assignSubFactory(new NSFactory().onTag('NATIONS', (me) => me.build('')
			.assignSubFactory(ArrayFactory
				.complex('NATION', CensusRankScored.create)))))
	.onTag('DISPATCH', (me, attrs) => me
		.build('dispatch')
		.assignSubFactory(Dispatch.create(attrs)))
	.onTag('DISPATCHLIST', (me) => me
		.build('dispatchList')
		.assignSubFactory(ArrayFactory
			.complex('DISPATCH', ListDispatch.create)))
	.onTag('FACTION', (me, attrs) => me
		.build('faction')
		.assignSubFactory(Faction.create(attrs)))
	.onTag('FACTIONS', (me) => me
		.build('factionList')
		.assignSubFactory(ArrayFactory
			.complex('FACTION', ListFaction.create)))
	.onTag('HAPPENINGS', (me) => me
		.build('happenings')
		.assignSubFactory(ArrayFactory
			.complex('EVENT', IDHappening.create)))
	.onTag('NEWNATIONDETAILS', (me) => me
		.build('nationsNewDetails')
		.assignSubFactory(ArrayFactory
			.complex('NEWNATION', NewNation.create)))
	.onTag('POLL', (me, attrs) => me
		.build('poll')
		.assignSubFactory(Poll.create(attrs)))
	.onTag('TGQUEUE', (me, attrs) => me
		.build('tgQueue')
		.assignSubFactory(TGQueue.create(attrs)));
