/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	ShardableRequest,
	nsify,
	nsifyList
} = require('./base');
const { WorldShard } = require('../shards');
const {
	CensusScale,
	DispatchCategory,
	DispatchSubcategory,
	DispatchSearchMode,
	HappeningsFilter,
	Tag
} = require('../enums');
const {
	num,
	txt,

	handle,
	handleList
} = require('./converter');

const { Banner, parseBanner }					= require('../typedefs/banner');
const { CensusRankScored, parseCensusRank }		= require('../typedefs/census-rank-scored');
const { WCensusAverage, parseCensusWorld }		= require('../typedefs/census-data-world');
const { Dispatch, parseDispatch }				= require('../typedefs/dispatch');
const { ListDispatch, parseDispatchOverview }	= require('../typedefs/dispatch-list-item');
const { Faction, parseFactionDetails }			= require('../typedefs/faction');
const { ListFaction, parseFaction }				= require('../typedefs/faction-list-item');
const { IDHappening, parseIDHappening }			= require('../typedefs/happening-id');
const { NewNation, parseNewNationsDetails }		= require('../typedefs/newnation');
const { Poll, parsePoll }						= require('../typedefs/poll');
const { TGQueue, parseTGQueue }					= require('../typedefs/tg-queue');

/**
 * Request subclass for building requests to the world endpoint of the API.
 */
class WorldRequest extends ShardableRequest {

	/**
	 * Defines one or more custom World Census scales to request for queries of the
	 * {@linkcode WorldShard.CENSUS}, {@linkcode WorldShard.CENSUS_DESCRIPTION},
	 * {@linkcode WorldShard.CENSUS_NAME}, {@linkcode WorldShard.CENSUS_RANKS}, and
	 * {@linkcode WorldShard.CENSUS_TITLE} shards. Only the `CENSUS` shard displays results for
	 * more than one scale, however; the others only return data for the first one submitted with
	 * this request instance. If not set, data on the featured scale is returned.
	 * @param {...number} scales ID(s) of the desired World Census scale(s); `null` to request all.
	 * @returns {this} The request, for chaining.
	 * @see {@linkcode CensusScale} for scale IDs
	 */
	setCensusScales(...scales) {
		if (scales) return this.setArgument('scale', ...scales);
		else if (scales === null) return this.setArgument('scale', 'all');
		else return this;
	}

	/**
	 * Defines a custom World Census scale and rank to start from for queries of the
	 * {@linkcode WorldShard.CENSUS_RANKS} shard. If not set, the featured scale is used.
	 * 
	 * *Note that the NS API uses the same argument name for the custom scale both here and for
	 * queries of all shards listed for the {@linkcode WorldRequest.setCensusScales} function, and
	 * setting it here will thus override any previously set via it in this request instance.*
	 * @param {number} scale ID of the desired World Census scale.
	 * @param {number} offset The rank from which to start (inclusive).
	 * @returns {this} The request, for chaining.
	 */
	setCensusLeaderboardOptions(scale, offset = 1) {
		if (typeof scale == 'number') this.setArgument('scale', scale);
		return this.setArgument('start', offset);
	}

	/**
	 * Defines the banners which should be queried with the {@linkcode WorldShard.BANNER} shard.
	 * @param  {...string} banners IDs of the desired banners.
	 * @returns {this} The request, for chaining.
	 */
	setBannerQuery(...banners) {
		return this.setArgument('banner', banners?.join(','));  // Requires separation by ','
	}

	/**
	 * Sets the ID of the dispatch to query with the {@linkcode WorldShard.DISPATCH} shard.
	 * @param {number} id ID of the desired dispatch.
	 * @returns {this} The request, for chaining.
	 */
	setDispatch(id) {
		return this.setArgument('dispatchid', id);
	}

	/**
	 * Defines custom criteria by which to query dispatches with the
	 * {@linkcode WorldShard.DISPATCH_LIST} shard.
	 * @param {string} author Set to only return dispatches authored by the nation with that name.
	 * @param {string} category Set to only display dispatches from a specific (sub)category.
	 * @param {string} searchMode Method of ordering the matching results.
	 * @returns {this} The request, for chaining.
	 * @see {@linkcode DispatchCategory} and {@linkcode DispatchSubcategory} for valid (sub)categories.
	 * @see {@linkcode DispatchSearchMode} for valid searching methods.
	 */
	setDispatchSearchOptions(author, category, searchMode) {
		if (author) this.setArgument('dispatchauthor', nsify(author));
		if (category) this.setArgument('dispatchcategory', category);
		if (searchMode) this.setArgument('dispatchsort', searchMode);
		return this;
	}

	/**
	 * Specifies the tags that the regions to query with the {@linkcode WorldShard.REGIONS_BY_TAG}
	 * shard must or must not have.
	 * @param  {...string} tags List of all tags that the desired regions must (not) have.
	 * @returns {this} The request, for chaining.
	 * @see {@linkcode Tag} for valid tags.
	 */
	setRegionSearchTags(...tags) {
		return this.setArgument('tags', tags?.join(','));   // Requires separation by ','
	}

	/**
	 * Sets the ID of the regional poll to query with the {@linkcode WorldShard.POLL} shard.
	 * @param {number} id ID of the desired poll.
	 * @returns {this} The request, for chaining.
	 */
	setPoll(id) {
		return this.setArgument('pollid', id);
	}

	/**
	 * Limits the list of happening events to be queried with the {@linkcode WorldShard.HAPPENINGS}
	 * shard to only those occurring after or before the happening event with the specified ID, or,
	 * if both are set, to those occurring between them.
	 * @param {number} start ID of the happenings event from which on to return happening events.
	 * @param {number} end ID of the happenings event up to which to return happening events.
	 * @returns {this} The request, for chaining.
	 */
	setHappeningsWindowID(start, end) {
		if (typeof start == 'number') this.setArgument('sinceid', start);
		if (typeof end == 'number') this.setArgument('beforeid', end);
		return this;
	}

	/**
	 * Limits the list of happening events to be queried with the {@linkcode WorldShard.HAPPENINGS}
	 * shard to only those occurring after or before the given timestamp, or, if both are set, to
	 * those occurring between them.
	 * @param {number} start Unix epoch timestamp from which on to return happening events.
	 * @param {number} end Unix epoch timestamp up to which to return happening events.
	 * @returns {this} The request, for chaining.
	 */
	setHappeningsWindowTime(start, end) {
		if (typeof start == 'number') this.setArgument('sincetime', start);
		if (typeof end == 'number') this.setArgument('beforetime', end);
		return this;
	}

	/**
	 * Limits the list of happening events to be queried with the {@linkcode WorldShard.HAPPENINGS}
	 * shard to those of the types included in the given list of filters.
	 * @param  {...string} filters List of all happening types to return happening events for.
	 * @returns {this} The request, for chaining.
	 * @see {@linkcode HappeningsFilter} for valid happening type filters.
	 */
	setHappeningsFilters(...filters) {
		return this.setArgument('filter', ...filters);
	}

	/**
	 * Sets a limit for how many happening events should be returned at most with queries of the
	 * {@linkcode WorldShard.HAPPENINGS} shard.
	 * @param {number} limit Maximum number of happenings to return. Must be between `1` and `200`.
	 * @returns {this} The request, for chaining.
	 */
	setHappeningsLimit(limit) {
		if (typeof limit == 'number') {
			if (limit < 1) limit = 1;
			else if (limit > 200) limit = 200;
			this.setArgument('limit', limit);
		}
		return this;
	}

	/**
	 * Specifies one or more nations from which alone to query happening events with the
	 * {@linkcode WorldShard.HAPPENINGS} shard. This cannot be combined with
	 * {@linkcode WorldRequest.setHappeningsRegions}, and will override any targets set via it.
	 * @param  {...string} nations Name(s) of the desired nations.
	 * @returns {this} The request, for chaining.
	 */
	setHappeningsNations(...nations) {
		return this.setArgument('view', `nation.${nsifyList(nations)?.join(',')}`);
	}

	/**
	 * Specifies one or more regions from which and its residents alone to query happening events
	 * with the {@linkcode WorldShard.HAPPENINGS} shard. This cannot be combined with
	 * {@linkcode WorldRequest.setHappeningsNations}, and will override any targets set via it.
	 * @param  {...string} regions Name(s) of the desired regions.
	 * @returns {this} The request, for chaining.
	 */
	setHappeningsRegions(...regions) {
		return this.setArgument('view', `region.${nsifyList(regions)?.join(',')}`);
	}

	/**
	 * Specify the ID of the N-Day faction to request details
	 * on with the {@linkcode WorldShard.FACTION} shard.
	 * @param {number} fid ID of the desired faction.
	 * @returns {this} The request, for chaining.
	 */
	setFactionID(fid) {
		return this.setArgument('id', fid);
	}

	/**
	 * Sends an HTTP request with all data specified in this request
	 * instance to the API and parses its response.
	 * @returns {Promise<World>} A world object holding all data returned.
	 */
	async send() {
		return new World(await super.send('WORLD'), this.getShards());
	}
}

/**
 * Represents the world of the NationStates multiverse. Only stores the data returned
 * by the API, without implementing any additional functions to do stuff with it.
 */
class World {
	constructor(parsed, shards) {
		if(parsed['$name'] !== 'WORLD') throw new Error('Invalid XML root');
		for(let tag in parsed) switch(tag) {

			/* === Primitive Properties === */

			case 'CENSUSID':
				/**
				 * ID of the day's featured {@linkcode CensusScale}.
				 * @type number
				 * @see {@linkcode WorldShard.CENSUS_ID}
				 */
				this.censusID = num(parsed, tag);
				break;

			case 'FEATUREDREGION':
				/**
				 * Name of the day's featured region.
				 * @type string
				 * @see {@linkcode WorldShard.FEATURED_REGION}
				 */
				this.featured = txt(parsed, tag);
				break;

			case 'LASTEVENTID':
				/**
				 * ID of the most recent happening event visible via the API.
				 * @type number
				 * @see {@linkcode WorldShard.LAST_EVENT_ID}
				 */
				this.lastEventID = num(parsed, tag);
				break;

			case 'NATIONS':
				/**
				 * List with the names of all currently existing nations.
				 * @type string[]
				 * @see {@linkcode WorldShard.NATIONS}
				 */
				this.nations = txt(parsed, tag)?.split(',');
				break;

			case 'NEWNATIONS':
				/**
				 * List with the names of the 50 most recently founded nations.
				 * @type string[]
				 * @see {@linkcode WorldShard.NEW_NATIONS}
				 */
				this.nationsNew = txt(parsed, tag)?.split(',');
				break;

			case 'NUMNATIONS':
				/**
				 * Total number of currently existing nations.
				 * @type number
				 * @see {@linkcode WorldShard.NUM_NATIONS}
				 */
				this.nationsNum = num(parsed, tag);
				break;

			case 'NUMREGIONS':
				/**
				 * Total number of currently existing regions.
				 * @type number
				 * @see {@linkcode WorldShard.NUM_REGIONS}
				 */
				this.regionsNum = num(parsed, tag);
				break;



			/* === Primitives with duplicate tags === */

			case 'REGIONS':
				if(shards.includes(WorldShard.REGIONS)) {
					/**
					 * List with the names of all currently existing regions.
					 * @type string[]
					 * @see {@linkcode WorldShard.REGIONS}
					 */
					this.regions = txt(parsed, tag)?.split(',');
					if(shards.includes(WorldShard.REGIONS_BY_TAG))
						/**
						 * List with the names of all regions having the queried {@linkcode Tag}s.
						 * @type string[]
						 * @see {@linkcode WorldShard.REGIONS_BY_TAG}
						 */
						this.regionsByTag = txt(parsed, tag, 1)?.split(',');
				} else this.regionsByTag = txt(parsed, tag, 1)?.split(',');
				break;


			/* === Complex Properties === */

			case 'BANNERS':
				/**
				 * List with the details of the queried banners.
				 * @type Banner[]
				 * @see {@linkcode WorldShard.BANNER}
				 */
				this.banners = handleList(parsed[tag][0], parseBanner);
				break;

			case 'CENSUS':
				/**
				 * List with the average scores of the queried World Census scales.
				 * @type WCensusAverage[]
				 * @see {@linkcode WorldShard.CENSUS}
				 */
				this.censusAverages = handleList(parsed[tag][0], parseCensusWorld);
				break;

			case 'CENSUSSCALE':
				/**
				 * Name of the measuring units of the queried World Census scale.
				 * @type string
				 * @see {@linkcode WorldShard.CENSUS_SCALE}
				 */
				this.censusScaleName = parsed[tag][0]?.['$text'];
				break;

			case 'CENSUSTITLE':
				/**
				 * Title of the queried World Census scale.
				 * @type string
				 * @see {@linkcode WorldShard.CENSUS_TITLE}
				 */
				this.censusTitle = parsed[tag][0]?.['$text'];
				break;

			case 'CENSUSDESC':
				/**
				 * Info text for how nations are ranked on the queried World Census scale.
				 * @type string
				 * @see {@linkcode WorldShard.CENSUS_DESCRIPTION}
				 */
				this.censusDescriptionNation = txt(parsed[tag][0], 'NDESC');
				/**
				 * Info text for how region are ranked on the queried World Census scale.
				 * @type string
				 * @see {@linkcode WorldShard.CENSUS_DESCRIPTION}
				 */
				this.censusDescriptionRegion = txt(parsed[tag][0], 'RDESC');
				break;

			case 'CENSUSRANKS':
				/**
				 * World-wide rank data of nations on the queried World Census scale.
				 * @type CensusRankScored[]
				 * @see {@linkcode WorldShard.CENSUS_RANKS}
				 */
				this.censusRanks = handleList(parsed[tag][0]?.['NATIONS'], parseCensusRank);
				break;

			case 'DISPATCH':
				/**
				 * Details of the queried dispatch.
				 * @type Dispatch
				 * @see {@linkcode WorldShard.DISPATCH}
				 */
				this.dispatch = handle(parsed[tag][0], parseDispatch);
				break;

			case 'DISPATCHLIST':
				/**
				 * List of the dispatches that matched the dispatch list query.
				 * @type ListDispatch
				 * @see {@linkcode WorldShard.DISPATCH_LIST}
				 */
				this.dispatchList = handleList(parsed[tag][0], parseDispatchOverview);
				break;

			case 'FACTION':
				/**
				 * Details of the queried N-Day faction.
				 * @type Faction
				 * @see {@linkcode WorldShard.FACTION}
				 */
				this.faction = handle(parsed[tag][0], parseFactionDetails);
				break;

			case 'FACTIONS':
				/**
				 * List of all extant N-Day factions.
				 * @type ListFaction
				 * @see {@linkcode WorldShard.FACTION_LIST}
				 */
				this.factionList = handleList(parsed[tag][0], parseFaction);
				break;

			case 'HAPPENINGS':
				/**
				 * List of the happening events that matched the happenings query.
				 * @type IDHappening[]
				 * @see {@linkcode WorldShard.HAPPENINGS}
				 */
				this.happenings = handleList(parsed[tag][0], parseIDHappening);
				break;

			case 'NEWNATIONDETAILS':
				/**
				 * List with the founding details of the 50 most recently founded nations.
				 * @type NewNation[]
				 * @see {@linkcode WorldShard.NEW_NATIONS_DETAILS}
				 */
				this.nationsNewDetails = handleList(parsed[tag][0], parseNewNationsDetails);
				break;

			case 'POLL':
				/**
				 * Details of the queried poll.
				 * @type Poll
				 * @see {@linkcode WorldShard.POLL}
				 */
				this.poll = parsePoll(parsed[tag][0]);
				break;

			case 'TGQUEUE':
				/**
				 * Details of the telegram queue.
				 * @type TGQueue
				 * @see {@linkcode WorldShard.TG_QUEUE}
				 */
				this.tgQueue = handle(parsed[tag][0], parseTGQueue);
				break;
		}
	}
}

exports.World = World;
exports.WorldRequest = WorldRequest;
