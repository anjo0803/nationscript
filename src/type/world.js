/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	CensusScale,
	Tag
} = require('../enums');

const {
	NSFactory,
	ArrayFactory,
	convertNumber,
	convertBoolean,
	convertArray
} = require('../factory');

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
 * Represents the world of the NationStates multiverse, containing all the data
 * requested from the World API.
 * @typedef {object} World
 * @prop {number} [censusID] ID of the day's featured {@link CensusScale}.
 * @prop {string} [featured] The day's featured region (`id_form`).
 * @prop {number} [lastEventID] ID of the most recent happening event visible
 *     to the API.
 * @prop {string[]} [nations] Names of currently existing nations (`id_form`).
 * @prop {string[]} [nationsNew] Names of the 50 most recently founded nations
 *     (`id_form`).
 * @prop {number} [nationsNum] Number of currently existing nations.
 * @prop {number} [regionsNum] Number of currently existing regions.
 * @prop {string[]} [regions] Names of currently existing regions (`id_form`).
 * @prop {string[]} [regionsByTag] Names of all regions matching the queried
 *     {@link Tag} requirements.
 * @prop {Banner.Banner[]} [banners] Details of the queried banners.
 * @prop {CensusDataWorld.WCensusAverage[]} [censusAverages] Average national
 *     scores on the queried {@link CensusScale}.
 * @prop {string} [censusScale] Name of the units the queried
 *     {@link CensusScale} is measured in.
 * @prop {string} [censusTitle] Title of the queried {@link CensusScale}.
 * @prop {CensusDescription.CensusDescription} [censusDescription] Info texts
 *     displayed for the queried {@link CensusScale}.
 * @prop {CensusRankScored.CensusRankScored[]} [censusRanks] Ranking of nations
 *     on the queried {@link CensusScale}.
 * @prop {Dispatch.Dispatch} [dispatch] Details of the queried dispatch.
 * @prop {ListDispatch.ListDispatch[]} [dispatchList] Dispatches that matched
 *     the selected dispatch filters.
 * @prop {Faction.Faction} [faction] Details of the queried N-Day faction.
 * @prop {ListFaction.ListFaction[]} [factionList] Extant N-Day factions.
 * @prop {IDHappening.IDHappening[]} [happenings] Happening events that matched
 *     the selected happenings filters.
 * @prop {NewNation.NewNation[]} [nationsNewDetails] Founding details of the 50
 *     most recently founded nations.
 * @prop {Poll.Poll} [poll] Details of the queried poll.
 * @prop {TGQueue.TGQueue} [tgQueue] Details of the telegram queue.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<World>} A new `World` factory
 */
exports.create = (root) => new NSFactory()
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
	/* .onTag('REGIONS', (me) => me
		.build('', val => {
			// TODO: duplicate tags
		})) */
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
