/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	ShardableRequest,
	nsify
} = require('./base');
const { RegionShard } = require('../shards');
const {
	CensusMode,
	CensusScale,
	CrosspostingPolicy,
	OfficerAuthority,
	Tag
} = require('../enums');
const {
	arr,
	num,
	txt,
	secureArray,

	handle,
	handleList
} = require('./converter');

const { WABadge, parseBadge }						= require('../typedefs/badge');
const { CensusDataRegion, parseCensusRegion }		= require('../typedefs/census-data-region');
const { CensusRankScored, parseCensusRank }			= require('../typedefs/census-rank-scored');
const { EmbassyData, parseEmbassies }				= require('../typedefs/embassy-data');
const { Happening, parseHappening }					= require('../typedefs/happening');
const { Officer, parseOfficer }						= require('../typedefs/officer');
const { Poll, parsePoll }							= require('../typedefs/poll');
const { RMBActivityAggregate, parseRMBLeaderboard }	= require('../typedefs/rmb-aggregate');
const { RMBPost, parseRMBMessage }					= require('../typedefs/rmb-post');
const { VoteTally, parseVoteTally }					= require('../typedefs/vote-tally');
const { ZombieDataRegion, parseZombieRegion }		= require('../typedefs/zombie-data-region');

/**
 * Request subclass for building requests to the regions endpoint of the API.
 */
class RegionRequest extends ShardableRequest {
	constructor(region) {
		super('region');
		this.setArgument('region', nsify(region));
	}

	/**
	 * Defines one or more custom World Census scales to request for queries of the
	 * {@linkcode RegionShard.CENSUS} shard. If not set, data on the featured scale is returned.
	 * 
	 * *Note that the NS API uses the same argument name for the custom scales here and for queries
	 * of the {@linkcode RegionShard.CENSUS_RANKS} shard, and setting them here will thus override
	 * any custom scales previously set via {@linkcode RegionRequest.setCensusLeaderboardOptions}
	 * in this request instance. Furthermore, setting more than one will break such a query with
	 * this instance and have it default to the featured scale.*
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
	 * Defines one or more modes to request the World Census scale data in for a query of the
	 * {@linkcode RegionShard.CENSUS} shard. If not set, {@linkcode CensusMode.SCORE} and
	 * {@linkcode CensusMode.RANK_WORLD} will be returned. {@linkcode CensusMode.RANK_REGION} and
	 * {@linkcode CensusMode.RANK_REGION_PERCENT} are ignored by the API.
	 * @param  {...string} modes Desired census modes. 
	 * @returns {this} The request, for chaining.
	 * @see {@linkcode CensusMode} for valid query modes.
	 */
	setCensusMode(...modes) {
		return this.setArgument('mode', ...modes);
	}

	/**
	 * Defines a custom World Census scale and rank to start from for queries of the
	 * {@linkcode RegionShard.CENSUS_RANKS} shard. If not set, the featured scale is used.
	 * 
	 * *Note that the NS API uses the same argument name for the custom scale both here and for
	 * queries of the {@linkcode RegionShard.CENSUS} shard, and setting it here will thus override
	 * any custom scales previously set via {@linkcode RegionRequest.setCensusScales} in this
	 * request instance.*
	 * @param {number} scale ID of the desired World Census scale.
	 * @param {number} offset The rank from which to start (inclusive). The default is `1`.
	 * @returns {this} The request, for chaining.
	 */
	setCensusLeaderboardOptions(scale, offset = 1) {
		if (typeof scale == 'number') this.setArgument('scale', scale);
		return this.setArgument('start', offset);
	}

	/**
	 * Defines custom criteria by which to query RMB messages with the
	 * {@linkcode RegionShard.RMB_MESSAGES} shard.
	 * 
	 * *Note that the NS API uses the same argument name for the message limit here and the nation
	 * limit for queries of the {@linkcode RegionShard.RMB_MOST_POSTS},
	 * {@linkcode RegionShard.RMB_MOST_LIKES}, or {@linkcode RegionShard.RMB_MOST_LIKED} shards,
	 * and setting it here will thus override a limit previously set via
	 * {@linkcode RegionRequest.setRMBLeaderboardOptions} in this request instance.*
	 * @param {number} limit Maximum number of messages to return; must be between `1` and `100`.
	 * @param {number} offset How many messages to shift the result list back.
	 * @param {number} start Post ID from which on to consider messages.
	 * @returns {this} The request, for chaining.
	 */
	setRMBHistoryOptions(limit, offset, start) {
		if (typeof limit == 'number') {
			if (limit < 1) limit = 1;
			else if (limit > 100) limit = 100;
			this.setArgument('limit', limit);
		}
		if (typeof offset == 'number') this.setArgument('offset', offset);
		if (typeof start == 'number') this.setArgument('fromid', start);
		return this;
	}

	/**
	 * Defines a time period for which to consider nations' aggregate RMB activity and a maximum
	 * number of nations to rank in queries of the {@linkcode RegionShard.RMB_MOST_POSTS},
	 * {@linkcode RegionShard.RMB_MOST_LIKES}, or {@linkcode RegionShard.RMB_MOST_LIKED} shards.
	 * 
	 * *Note that the NS API uses the same argument name for the nation limit here and the message
	 * limit for queries of the {@linkcode RegionShard.RMB_MESSAGES} shard, and setting it here
	 * will thus override a limit previously set via {@linkcode RegionRequest.setRMBHistoryOptions}
	 * in this request instance.*
	 * @param {number} limit Maximum number of nations to return.
	 * @param {number} from Unix epoch timestamp from which on to consider RMB activity.
	 * @param {number} to Unix epoch timestamp up to which to consider RMB activity.
	 * @returns {this} The request, for chaining.
	 */
	setRMBLeaderboardOptions(limit, from, to) {
		if (typeof limit == 'number') this.setArgument('limit', limit);
		if (typeof from == 'number') this.setArgument('from', from);
		if (typeof to == 'number') this.setArgument('to', to);
		return this;
	}

	/**
	 * Sends an HTTP request with all data specified in this request
	 * instance to the API and parses its response.
	 * @returns {Promise<Region>} A region object holding all data returned.
	 */
	async send() {
		return new Region(await super.send('REGION'));
	}
}

/**
 * Represents a region in the NationStates multiverse. Only stores the data returned
 * by the API, without implementing any additional functions to do stuff with it.
 */
class Region {
	constructor(parsed) {
		if(parsed['$name'] !== 'REGION') throw new Error('Invalid XML root');
		for(let tag in parsed) switch(tag) {

			/* === Primitive Properties === */

			case 'BANNED':
				/**
				 * List with the names of all nations currently banned from the region.
				 * @type string[]
				 * @see {@linkcode RegionShard.BANLIST}
				 */
				this.banned = txt(parsed, tag)?.split(':') || [];
				break;

			case 'BANNER':
				/**
				 * Banner ID of the region's current regional banner.
				 * `null` if the region doesn't fly a custom banner.
				 * @type string
				 * @see {@linkcode RegionShard.BANNER}
				 */
				this.bannerID = txt(parsed, tag) || null;
				break;

			case 'BANNERBY':
				/**
				 * Name of the nation that set the region's current regional banner.
				 * `null` if the region doesn't fly a custom banner.
				 * @type string
				 * @see {@linkcode RegionShard.BANNER_UPLOADER}
				 */
				this.bannerCreator = txt(parsed, tag);
				if(this.bannerCreator === '0') this.bannerCreator = null;
				break;

			case 'BANNERURL':
				/**
				 * URL to the image file for the region's banner on the NationStates server.
				 * @type string
				 * @see {@linkcode RegionShard.BANNER_URL}
				 */
				this.bannerURL = txt(parsed, tag);
				break;

			case 'DBID':
				/**
				 * Database ID of the region.
				 * @type number
				 * @see {@linkcode RegionShard.DATABASE_ID}
				 */
				this.id = num(parsed, tag);
				break;

			case 'DISPATCHES':
				/**
				 * List with the IDs of all dispatches currently pinned to the region's WFE.
				 * @type string[]
				 * @see {@linkcode RegionShard.DISPATCHES}
				 */
				this.pinnedDispatches = txt(parsed, tag)?.split(',') || [];
				break;

			case 'DELEGATE':
				/**
				 * Name of the nation currently serving as the region's World Assembly delegate.
				 * `null` if there is no Delegate.
				 * @type string
				 * @see {@linkcode RegionShard.DELEGATE}
				 */
				this.delegateName = txt(parsed, tag);
				if(this.delegateName === '0') this.delegateName = null;
				break;

			case 'DELEGATEAUTH':
				/**
				 * List of the Delegate's {@linkcode OfficerAuthority} codes.
				 * @type string[]
				 * @see {@linkcode RegionShard.DELEGATE_AUTHORITY}
				 */
				this.delegateAuthorities = [...txt(parsed, tag)];
				break;

			case 'DELEGATEVOTES':
				/**
				 * Total number of votes the region's delegate currently has in the World Assembly.
				 * @type number
				 * @see {@linkcode RegionShard.DELEGATE_VOTE_WEIGHT}
				 */
				this.delegateVotes = num(parsed, tag);
				break;

			case 'EMBASSYRMB':
				/**
				 * The {@linkcode CrosspostingPolicy} of the region.
				 * @type string
				 * @see {@linkcode RegionShard.RMB_CROSSPOSTING_POLICY}
				 */
				this.crossposting = txt(parsed, tag);
				break;

			case 'FACTBOOK':
				/**
				 * Body text of the region's World Factbook Entry.
				 * @type string
				 * @see {@linkcode RegionShard.WFE}
				 */
				this.wfe = txt(parsed, tag);
				break;

			case 'FLAG':
				/**
				 * URL of the image file for the region's flag on the NationStates server.
				 * @type string
				 * @see {@linkcode RegionShard.FLAG}
				 */
				this.flag = txt(parsed, tag);
				break;

			case 'FOUNDED':
				/**
				 * Textual reference to when the region was founded, relative to now.
				 * @type string
				 * @see {@linkcode RegionShard.FOUNDED}
				 */
				this.founded = txt(parsed, tag);
				break;

			case 'FOUNDEDTIME':
				/**
				 * Unix epoch timestamp of when the region was founded.
				 * @type number
				 * @see {@linkcode RegionShard.FOUNDED_TIME}
				 */
				this.foundedTime = num(parsed, tag);
				break;

			case 'FRONTIER':
				/**
				 * Whether or not the region is a Frontier.
				 * @type boolean
				 * @see {@linkcode RegionShard.FRONTIER_STATUS}
				 */
				this.isFrontier = num(parsed, tag) === 1;
				break;

			case 'GOVERNOR':
				/**
				 * Name of the nation serving as the region's governor.
				 * `null` if the region doesn't have a governor.
				 * @type string
				 * @see {@linkcode RegionShard.GOVERNOR}
				 */
				this.governor = txt(parsed, tag);
				if(this.governor === '0') this.governor = null;
				break;

			case 'LASTUPDATE':
				/**
				 * Unix epoch timestamp of when the region last updated.
				 * @type number
				 * @see {@linkcode RegionShard.LAST_UPDATE}
				 */
				this.updateLast = num(parsed, tag);
				break;

			case 'LASTMAJORUPDATE':
				/**
				 * Unix epoch timestamp of when the region last updated during a Major update.
				 * @type number
				 * @see {@linkcode RegionShard.LAST_UPDATE_MAJOR}
				 */
				this.updateMajor = num(parsed, tag);
				break;

			case 'LASTMINORUPDATE':
				/**
				 * Unix epoch timestamp of when the region last updated during a Minor update.
				 * @type number
				 * @see {@linkcode RegionShard.LAST_UPDATE_MINOR}
				 */
				this.updateMinor = num(parsed, tag);
				break;

			case 'NAME':
				/**
				 * (Authentically capitalised) name of the region.
				 * @type string
				 * @see {@linkcode RegionShard.NAME}
				 */
				this.name = txt(parsed, tag);
				break;

			case 'NATIONS':
				/**
				 * List with the names of all nations currently residing in the region.
				 * @type string[]
				 * @see {@linkcode RegionShard.NATIONS}
				 */
				this.nations = txt(parsed, tag)?.split(':') || [];
				break;

			case 'NUMNATIONS':
				/**
				 * Total number of nations currently residing in the region.
				 * @type number
				 * @see {@linkcode RegionShard.NUM_NATIONS}
				 */
				this.nationsNum = num(parsed, tag);
				break;

			case 'NUMUNNATIONS':
				/**
				 * Total number of WA member nations currently residing in the region.
				 * @type number
				 * @see {@linkcode RegionShard.NUM_NATIONS}
				 */
				this.nationsWANum = num(parsed, tag);
				break;

			case 'UNNATIONS':
				/**
				 * List with the names of all WA member nations currently residing in the region.
				 * @type string[]
				 * @see {@linkcode RegionShard.WA_MEMBERS}
				 */
				this.nationsWA = txt(parsed, tag)?.split(',') || [];
				break;

			case 'POWER':
				/**
				 * Textual description of the total influence among nations in the region.
				 * @type string
				 * @see {@linkcode RegionShard.POWER}
				 */
				this.powerLevel = txt(parsed, tag);
				break;

			case 'TAGS':
				/**
				 * List of all {@linkcode Tag}s the region currently has.
				 * @type string[]
				 * @see {@linkcode RegionShard.TAGS}
				 */
				this.tags = arr(parsed, tag);
				break;


			/* === Complex Properties === */

			case 'CENSUS':
				/**
				 * Performance of the region on the queried World Census scales.
				 * @type CensusDataRegion
				 * @see {@linkcode RegionShard.CENSUS}
				 */
				this.census = handleList(parsed[tag][0], parseCensusRegion)
				break;

			case 'CENSUSRANKS':
				/**
				 * List of resident nations ranked by their score on a World Census scale.
				 * @type CensusRankScored[]
				 * @see {@linkcode RegionShard.CENSUS_RANKS}
				 */
				this.censusRanks = handleList(parsed[tag][0]?.['NATIONS'], parseCensusRank);
				break;

			case 'EMBASSIES':
				/**
				 * Lists with the names of all regions that have an embassy with this region or
				 * have sent or received such a request within the last week.
				 * @type EmbassyData
				 * @see {@linkcode RegionShard.EMBASSIES}
				 */
				this.embassies = handle(secureArray(parsed[tag][0]), parseEmbassies);
				break;

			case 'FOUNDER':
				let f = txt(parsed, tag);
				/**
				 * Name of the nation that founded the region, or `null` if founderless.
				 * @type string
				 * @see {@linkcode RegionShard.FOUNDER}
				 */
				this.founder = f == '0' ? null : f;

			case 'GAVOTE':
				/**
				 * Current tally of For and Against votes on the at-vote GA resolution
				 * from among WA member nations residing in the region.
				 * @type VoteTally
				 * @see {@linkcode RegionShard.VOTE_GA}
				 */
				this.voteGA = handle(parsed[tag][0], parseVoteTally);
				break;

			case 'HAPPENINGS':
				/**
				 * List of the most recent happening events in the region.
				 * @type Happening[]
				 * @see {@linkcode RegionShard.HAPPENINGS}
				 */
				this.happenings = handleList(parsed[tag][0], parseHappening);
				break;

			case 'HISTORY':
				/**
				 * List of the most important historical events in the region.
				 * @type Happening[]
				 * @see {@linkcode RegionShard.HISTORY}
				 */
				this.history = handleList(parsed[tag][0], parseHappening);
				break;

			case 'MESSAGES':
				/**
				 * List of the RMB messages that matched the query.
				 * @type RMBPost[]
				 * @see {@linkcode RegionShard.RMB_MESSAGES}
				 */
				this.messages = handleList(parsed[tag][0], parseRMBMessage);
				break;

			case 'MOSTPOSTS':
				/**
				 * List of nations' aggregate posting activity on the region's RMB.
				 * @type RMBActivityAggregate[]
				 * @see {@linkcode RegionShard.RMB_MOST_POSTS}
				 */
				this.rmbMostPosts = parseRMBLeaderboard(parsed[tag], 'POSTS');
				break;

			case 'MOSTLIKED':
				/**
				 * List of nations' aggregate liking activity on the region's RMB.
				 * @type RMBActivityAggregate[]
				 * @see {@linkcode RegionShard.RMB_MOST_LIKED}
				 */
				this.rmbMostLikesGiven = parseRMBLeaderboard(parsed[tag], 'LIKED');
				break;

			case 'MOSTLIKES':
				/**
				 * List of nations' aggregate number of received likes on the region's RMB.
				 * @type RMBActivityAggregate[]
				 * @see {@linkcode RegionShard.RMB_MOST_LIKES}
				 */
				this.rmbMostLikesReceived = parseRMBLeaderboard(parsed[tag], 'LIKES');
				break;

			case 'OFFICERS':
				/**
				 * List of the region's officer nations.
				 * @type Officer[]
				 * @see {@linkcode RegionShard.OFFICERS}
				 */
				this.officers = handleList(parsed[tag][0], parseOfficer);
				break;

			case 'POLL':
				/**
				 * The poll currently running in the region.
				 * @type Poll
				 * @see {@linkcode RegionShard.POLL}
				 */
				this.poll = handle(parsed[tag][0], parsePoll);
				break;

			case 'SCVOTE':
				/**
				 * Current tally of For and Against votes on the at-vote SC resolution
				 * from among WA member nations residing in the region.
				 * @type VoteTally
				 * @see {@linkcode RegionShard.VOTE_SC}
				 */
				this.voteSC = handle(parsed[tag][0], parseVoteTally);
				break;

			case 'WABADGES':
				/**
				 * List of all commendationm condemnation, liberation,
				 * and injunction badges the region currently has.
				 * @type WABadge[]
				 * @see {@linkcode RegionShard.WA_BADGES}
				 */
				this.badges = handleList(parsed[tag][0], parseBadge);
				break;

			case 'ZOMBIE':
				/**
				 * Details of the region's Z-Day performance.
				 * @type ZombieDataRegion
				 * @see {@linkcode RegionShard.ZOMBIE}
				 */
				this.zombie = handle(parsed[tag][0], parseZombieRegion);
				break;
		}
	}
}

exports.Region = Region;
exports.RegionRequest = RegionRequest;
