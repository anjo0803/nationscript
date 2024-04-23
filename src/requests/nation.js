/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	ShardableRequest,
	nsify
} = require('./base');
const {
	NationShard,
	NationPrivateShard
} = require('../shards');
const {
	Admirable,
	CensusMode,
	CensusScale,
	Influence,
	Notable,
	Sensibility,
	WAStatus,
	WAVote
} = require('../enums');
const {
	arr,
	num,
	txt,

	handle,
	handleList
} = require('./converter');

const { WABadge, parseBadge }					= require('../typedefs/badge');
const { CensusDataNation, parseCensusNation }	= require('../typedefs/census-data-nation');
const { CensusRankUnscored, parseCensusRankUnscored }	= require('../typedefs/census-rank-unscored');
const { DeathData, parseDeath }					= require('../typedefs/death-data');
const { FreedomsTextData, parseFreedomsText }	= require('../typedefs/freedoms-descriptions');
const { FreedomsScoreData, parseFreedomsValue }	= require('../typedefs/freedoms-scores');
const { ListDispatch, parseDispatchOverview }	= require('../typedefs/dispatch-list-item');
const { Happening, parseHappening }				= require('../typedefs/happening');
const { HDIData, parseHDI }						= require('../typedefs/hdi-data');
const { Issue, parseIssue }						= require('../typedefs/issue');
const { ListIssue, parseSummary }				= require('../typedefs/issue-list-item');
const { Notice, parseNotice }					= require('../typedefs/notice');
const { Policy, parsePolicy }					= require('../typedefs/policy');
const { SectorsData, parseSectors }				= require('../typedefs/sectors-data');
const { SpendingData, parseSpending }			= require('../typedefs/spending-data');
const { UnreadsData, parseUnreads }				= require('../typedefs/unreads-data');
const { ZombieDataNation, parseZombieNation }	= require('../typedefs/zombie-data-nation');

/**
 * Request subclass for building requests to the nations endpoint of the API.
 */
class NationRequest extends ShardableRequest {
	/**
	 * The login credentials for the nation that should execute the command.
	 * @type NSCredential
	 */
	#credentials;

	constructor(nation, ...required) {
		super('nation', ...required);
		this.setArgument('nation', nsify(nation));
	}

	/**
	 * Adds the given {@linkcode NSCredential} to this request for authentication with the NS API.
	 * Authentication is necessary for nation requests that query a {@linkcode NationPrivateShard}.
	 * @param {NSCredential} credentials The authentication data.
	 * @returns {this} The request, for chaining.
	 */
	authenticate(credentials) {
		this.#credentials = credentials;
		return this;
	}

	/**
	 * Gets the login credentials currently set for this request.
	 * @returns {NSCredential} The login credentials.
	 */
	getCredentials() {
		return this.#credentials;
	}

	/**
	 * Sets a hypothetical sender region for queries of the {@linkcode NationShard.TG_RECRUITABLE}
	 * and {@linkcode NationShard.TG_CAMPAIGNABLE} shards.
	 * 
	 * *Note that the NS API uses the same argument name for the sender, the starting timestamp for
	 * queries of the {@linkcode NationShard.CENSUS} shard (in history mode), and the display
	 * timestamp for the {@linkcode NationPrivateShard.NOTICES} shard, and it thus is impossible to
	 * use this function without removing data set for one of those in this request instance.*
	 * @param {string} sender Name of the theoretical sender region.
	 * @returns {this} The request, for chaining.
	 */
	setTGSender(sender) {
		return this.setArgument('from', sender);
	}

	/**
	 * Defines one or more World Census scales to query with the {@linkcode NationShard.CENSUS}
	 * shard. By default, the API returns results for the day's featured scale.
	 * @param {...number} scales ID(s) of the desired World Census scale(s); `null` to request all.
	 * @returns {this} The request, for chaining.
	 * @see {@linkcode CensusScale} for the valid scale IDs
	 */
	setCensusScale(...scales) {
		if (scales) return this.setArgument('scale', ...scales);
		else if (scales === null) return this.setArgument('scale', 'all');
		else return this;
	}

	/**
	 * Sets one or more modes to request the World Census scale data in for a query of the
	 * {@linkcode NationShard.CENSUS} shard. By default, {@linkcode CensusMode.SCORE},
	 * {@linkcode CensusMode.RANK_REGION}, and {@linkcode CensusMode.RANK_WORLD} are returned.
	 * @param  {...string} modes The desired query modes.
	 * @returns {this} The request, for chaining.
	 * @see {@linkcode CensusMode} for valid query modes.
	 */
	setCensusMode(...modes) {
		return this.setArgument('mode', ...modes);
	}
	/**
	 * Sets the World Census query mode to history mode, allowing lookup of historical data points
	 * for raw score only. Any modes previously set via {@linkcode NationRequest.setCensusMode} are
	 * overwritten, since history mode cannot be combined with other modes.
	 * 
	 * *Note that the NS API uses the same argument name for the starting timestamp, the TG sender
	 * for the {@linkcode NationShard.TG_RECRUITABLE} and {@linkcode NationShard.TG_CAMPAIGNABLE},
	 * and the display timestamp for the {@linkcode NationPrivateShard.NOTICES} shards, and it thus
	 * is impossible to use this function without removing data set for one of those with this
	 * request instance.*
	 * @param {number | null} from Unix epoch timestamp from which on to request the data.
	 * @param {number | null} to Unix epoch timestamp up to which to request the data.
	 * @returns {this} The request, for chaining.
	 */
	setHistoryMode(from, to) {
		return this
			.setCensusMode('history')   // History mode cannot be combined with other modes
			.setArgument('from', from)
			.setArgument('to', to);
	}

	/**
	 * Sets the timestamp from which on to display notices for queries of the
	 * {@linkcode NationPrivateShard.NOTICES} shard.
	 * 
	 * *Note that the NS API uses the same argument name for this timestamp, the telegram sender
	 * for the {@linkcode NationShard.TG_RECRUITABLE} and {@linkcode NationShard.TG_CAMPAIGNABLE}
	 * shards, and the starting timestamp for queries of the {@linkcode NationShard.CENSUS} shard,
	 * and it thus is impossible to use this function without removing data set for one of those in
	 * this request instance.*
	 * @param {number} from Unix epoch timestamp from which on to display notices.
	 * @returns {this} The request, for chaining.
	 */
	setDisplayNotices(from) {
		return this.setArgument('from', from);
	}

	/**
	 * Adds a request to the nation login verification endpoint to this request instance.
	 * @param {string} checksum The [checksum](https://www.nationstates.net/page=verify_login).
	 * @param {string} token Custom token for the verification process, or `null` if none was used.
	 * @returns {this} The request, for chaining.
	 */
	verify(checksum, token = null) {
		return this
			.setArgument('a', 'verify')
			.setArgument('checksum', checksum)
			.setArgument('token', token);
	}

	/**
	 * Sends an HTTP request with all data specified in this request
	 * instance to the API and parses its response.
	 * @returns {Promise<Nation>} A nation object holding all the data returned.
	 */
	async send() {
		if(this.getArgument('a') === 'verify' && this.getShards().length === 0)
			return new Nation({		// If no shards are requested, the API only returns `1` or `0`,
				'$name': 'NATION',	// so this fictionalised parsed XML is instead passed as root.
				'VERIFY': [ await super.raw() ]
			}, this.getShards());
		else return new Nation(await super.send('NATION'), this.getShards());
	}
}

/**
 * Represents a nation in the NationStates multiverse. Only stores the nation data returned by the
 * API, without implementing any additional functions to do stuff with it.
 */
class Nation {
	constructor(parsed, shards) {
		if(parsed['$name'] !== 'NATION') throw new Error('Invalid XML root');
		for(let tag in parsed) switch(tag) {

			/* === Primitive Properties === */

			case 'ADMIRABLE':
				/**
				 * One random {@linkcode Admirable} the nation is eligible for.
				 * @type string
				 * @see {@linkcode NationShard.ADMIRABLE}
				 */
				this.admirable = txt(parsed, tag);
				break;

			case 'ADMIRABLES':
				/**
				 * List with all {@linkcode Admirable}s the nation is eligible for.
				 * @type string[]
				 * @see {@linkcode NationShard.ADMIRABLES}
				 */
				this.admirables = arr(parsed, tag);
				break;

			case 'ANIMAL':
				/**
				 * Name of the nation's national animal.
				 * @type string
				 * @see {@linkcode NationShard.ANIMAL}
				 */
				this.animal = txt(parsed, tag);
				break;

			case 'ANIMALTRAIT':
				/**
				 * Behaviour trait of the nation's national animal.
				 * @type string
				 * @see {@linkcode NationShard.ANIMAL_TRAIT}
				 */
				this.animalTrait = txt(parsed, tag);
				break;

			case 'BANNER':
				/**
				 * Banner code for the banner image to initially display for the nation. This is
				 * that of the nation's primary banner, if it has set one, and otherwise that of a
				 * random banner the nation is eligible for and hasn't turned off.
				 * @type string
				 * @see {@linkcode NationShard.BANNER}
				 */
				this.banner = txt(parsed, tag);
				break;

			case 'BANNERS':
				/**
				 * List with all banner codes of the banners that can display for the nation
				 * (meaning it is eligible for and hasn't turned off). If set, the nation's primary
				 * banner will be listed first.
				 * @type string[]
				 * @see {@linkcode NationShard.BANNERS}
				 */
				this.banners = arr(parsed, tag);
				break;

			case 'CATEGORY':
				/**
				 * World Census classification of the nation.
				 * @type string
				 * @see {@linkcode NationShard.CATEGORY}
				 */
				this.category = txt(parsed, tag);
				break;

			case 'CRIME':
				/**
				 * Textual description of crime levels in the nation.
				 * @type string
				 * @see {@linkcode NationShard.CRIME}
				 */
				this.crime = txt(parsed, tag);
				break;

			case 'CURRENCY':
				/**
				 * Name of the nation's currency.
				 * @type string
				 * @see {@linkcode NationShard.CURRENCY}
				 */
				this.currency = txt(parsed, tag);
				break;

			case 'DBID':
				/**
				 * Database ID of the nation. This is equal to its card's ID.
				 * @type number
				 * @see {@linkcode NationShard.DATABASE_ID}
				 */
				this.id = num(parsed, tag);
				break;

			case 'DEMONYM':
				/**
				 * The adjective demonym for the nation.
				 * @type string
				 * @see {@linkcode NationShard.DEMONYM_ADJECTIVE}
				 */
				this.demonymAdjective = txt(parsed, tag);
				break;

			case 'DEMONYM2':
				/**
				 * The noun demonym for a singular citizen of the nation.
				 * @type string
				 * @see {@linkcode NationShard.DEMONYM_NOUN}
				 */
				this.demonymNoun = txt(parsed, tag);
				break;

			case 'DEMONYM2PLURAL':
				/**
				 * The noun demonym for multiple citizens of the nation.
				 * @type string
				 * @see {@linkcode NationShard.DEMONYM_NOUN_PLURAL}
				 */
				this.demonymPlural = txt(parsed, tag);
				break;

			case 'DISPATCHES':
				/**
				 * Total number of extant dispatches authored by the nation.
				 * @type number
				 * @see {@linkcode NationShard.DISPATCHES}
				 */
				this.dispatchNum = num(parsed, tag);
				break;

			case 'DOSSIER':
				/**
				 * List with the names of all nations in the dossier of the nation.
				 * @type string[]
				 * @see {@linkcode NationPrivateShard.DOSSIER_NATIONS}
				 */
				this.dossierNations = arr(parsed, tag);
				break;

			case 'ENDORSEMENTS':
				/**
				 * List with the names of all nations the nation is endorsed by.
				 * @type string[]
				 * @see {@linkcode NationShard.ENDORSEMENTS}
				 */
				this.endorsements = txt(parsed, tag)?.split(',') || [];
				break;

			case 'FACTBOOKS':
				/**
				 * Total number of extant factbooks authored by the nation.
				 * @type number
				 * @see {@linkcode NationShard.FACTBOOKS}
				 */
				this.factbookNum = num(parsed, tag);
				break;

			case 'FIRSTLOGIN':
				/**
				 * Unix epoch timestamp of when the nation first logged in.
				 * @type number
				 * @see {@linkcode NationShard.FIRST_LOGIN}
				 */
				this.firstLogin = num(parsed, tag);
				break;

			case 'FLAG':
				/**
				 * Absolute URL of the image file for the nation's flag on the NationStates server.
				 * @type string
				 * @see {@linkcode NationShard.FLAG}
				 */
				this.flag = txt(parsed, tag);
				break;

			case 'FOUNDED':
				/**
				 * Textual reference to when the nation was founded, relative to now.
				 * @type string
				 * @see {@linkcode NationShard.FOUNDED}
				 */
				this.founded = txt(parsed, tag);
				break;

			case 'FOUNDEDTIME':
				/**
				 * Unix epoch timestamp of when the nation was founded.
				 * @type number
				 * @see {@linkcode NationShard.FOUNDED_TIME}
				 */
				this.foundedTimestamp = num(parsed, tag);
				break;

			case 'FULLNAME':
				/**
				 * Full name of the nation, in the format
				 * "The {@linkcode Nation.pretitle} of {@linkcode Nation.name}".
				 * @type string
				 * @see {@linkcode NationShard.FULL_NAME}
				 */
				this.nameFull = txt(parsed, tag);
				break;

			case 'GAVOTE':
				/**
				 * {@linkcode WAVote} of the nation in the General Assembly.
				 * @type string
				 * @see {@linkcode NationShard.VOTE_GA}
				 */
				this.voteGA = txt(parsed, tag);
				break;

			case 'GDP':
				/**
				 * Total GDP score of the nation.
				 * @type number
				 * @see {@linkcode NationShard.GDP}
				 */
				this.gdp = num(parsed, tag);
				break;

			case 'GOVTDESC':
				/**
				 * Textual description of governmental operations in the nation.
				 * @type string
				 * @see {@linkcode NationShard.GOVERNMENT_DESCRIPTION}
				 */
				this.government = txt(parsed, tag);
				break;

			case 'GOVTPRIORITY':
				/**
				 * Name of the field in the nation's {@linkcode Nation.expenditure} constituting
				 * the plurality of the full government expenditure.
				 * @type string
				 * @see {@linkcode NationShard.GOVERNMENT_PRIORITY}
				 */
				this.spendingPriority = txt(parsed, tag);
				break;

			case 'INCOME':
				/**
				 * Total average income of the nation's citizens.
				 * @type number
				 * @see {@linkcode NationShard.INCOME}
				 */
				this.incomeAverage = num(parsed, tag);
				break;

			case 'INDUSTRYDESC':
				/**
				 * Textual description of the industrial situation in the nation.
				 * @type string
				 * @see {@linkcode NationShard.INDUSTRY_DESCRIPTION}
				 */
				this.descriptionIndustry = txt(parsed, tag);
				break;

			case 'INFLUENCE':
				/**
				 * Level of {@linkcode Influence} the nation has in its region.
				 * @type string
				 * @see {@linkcode NationShard.INFLUENCE}
				 */
				this.influence = txt(parsed, tag);
				break;

			case 'ISSUES_ANSWERED':
				/**
				 * Total number of issues the nation has answered.
				 * @type number
				 * @see {@linkcode NationShard.ISSUES_ANSWERED}
				 */
				this.issuesAnswered = num(parsed, tag);
				break;

			case 'LASTACTIVITY':
				/**
				 * Textual reference to the time of the nation's last login, relative to now.
				 * @type string
				 * @see {@linkcode NationShard.LAST_LOGIN}
				 */
				this.lastLogin = txt(parsed, tag);
				break;

			case 'LASTLOGIN':
				/**
				 * Unix epoch timestamp of when the nation last logged in.
				 * @type number
				 * @see {@linkcode NationShard.LAST_LOGIN_TIME}
				 */
				this.lastLoginTimestamp = num(parsed, tag);
				break;

			case 'LEGISLATION':
				/**
				 * List with the effect lines of the nations four most recently answered issues.
				 * @type string[]
				 * @see {@linkcode NationShard.LEGISLATION}
				 */
				this.legislation = arr(parsed, tag);
				break;

			case 'MAJORINDUSTRY':
				/**
				 * Name of the nation's largest industry.
				 * @type string
				 * @see {@linkcode NationShard.MAJOR_INDUSTRY}
				 */
				this.majorIndustry = txt(parsed, tag);
				break;

			case 'MOTTO':
				/**
				 * National motto of the nation.
				 * @type string
				 * @see {@linkcode NationShard.MOTTO}
				 */
				this.motto = txt(parsed, tag);
				break;

			case 'NAME':
				/**
				 * (Authentically capitalised) name of the nation.
				 * @type string
				 * @see {@linkcode NationShard.NAME}
				 */
				this.name = txt(parsed, tag);
				break;

			case 'NEXTISSUE':
				/**
				 * Textual reference to when the nation will face its next issue, relative to now.
				 * @type string
				 * @see {@linkcode NationPrivateShard.NEXT_ISSUE}
				 */
				this.nextIssue = txt(parsed, tag);
				break;

			case 'NEXTISSUETIME':
				/**
				 * Unix epoch timestamp for when the nation will face its next issue.
				 * @type number
				 * @see {@linkcode NationPrivateShard.NEXT_ISSUE_TIME}
				 */
				this.nextIssueTime = num(parsed, tag);
				break;

			case 'NOTABLE':
				/**
				 * One random {@linkcode Notable} the nation is eligible for.
				 * @type string
				 * @see {@linkcode NationShard.NOTABLE}
				 */
				this.notable = txt(parsed, tag);
				break;

			case 'NOTABLES':
				/**
				 * List of all {@linkcode Notable}s the nation is eligible for.
				 * @type string[]
				 * @see {@linkcode NationShard.NOTABLES}
				 */
				this.notables = arr(parsed, tag);
				break;

			case 'PACKS':
				/**
				 * Number of unopened trading card packs the nation has.
				 * @type number
				 * @see {@linkcode NationPrivateShard.PACKS}
				 */
				this.packs = num(parsed, tag);
				break;

			case 'PING':
				/**
				 * Whether the ping to the nation was successful.
				 * @type boolean
				 * @see {@linkcode NationPrivateShard.PING}
				 */
				this.ping = num(parsed, tag) == 1;
				break;

			case 'POOREST':
				/**
				 * Average income of the nation's poorest 10% of citizens.
				 * @type number
				 * @see {@linkcode NationShard.INCOME_POOREST}
				 */
				this.incomePoorest = num(parsed, tag);
				break;

			case 'POPULATION':
				/**
				 * Total number of citizens the nation has.
				 * @type number
				 * @see {@linkcode NationShard.POPULATION}
				 */
				this.population = num(parsed, tag);
				break;

			case 'PUBLICSECTOR':
				/**
				 * Percentage of the nation's GDP generated directly by government action.
				 * @type number
				 * @see {@linkcode NationShard.PUBLIC_SECTOR}
				 */
				this.gdpGovernment = num(parsed, tag);
				break;

			case 'RDOSSIER':
				/**
				 * List with the names of all regions in the dossier of the nation.
				 * @type string[]
				 * @see {@linkcode NationPrivateShard.DOSSIER_REGIONS}
				 */
				this.dossierRegions = arr(parsed, tag);
				break;

			case 'REGION':
				/**
				 * Name of the region the nation resides in.
				 * @type string
				 * @see {@linkcode NationShard.REGION}
				 */
				this.region = txt(parsed, tag);
				break;

			case 'RICHEST':
				/**
				 * Average income of the nation's richest 10% of citizens.
				 * @type number
				 * @see {@linkcode NationShard.INCOME_RICHEST}
				 */
				this.incomeRichest = num(parsed, tag);
				break;

			case 'SCVOTE':
				/**
				 * {@linkcode WAVote} of the nation in the Security Council.
				 * @type string
				 * @see {@linkcode NationShard.VOTE_SC}
				 */
				this.voteSC = txt(parsed, tag);
				break;

			case 'SENSIBILITIES':
				/**
				 * List with all {@linkcode Sensibility} traits of the nation's citizens.
				 * @type string[]
				 * @see {@linkcode NationShard.SENSIBILITIES}
				 */
				this.sensibilities = txt(parsed, tag)?.split(', ');
				break;

			case 'TAX':
				/**
				 * Total average income tax rate in the nation.
				 * @type number
				 * @see {@linkcode NationShard.TAX}
				 */
				this.tax = num(parsed, tag);
				break;

			case 'TGCANCAMPAIGN':
				/**
				 * Whether or not the nation will receive a WA campaign telegram.
				 * @type boolean
				 * @see {@linkcode NationShard.TG_CAMPAIGNABLE}
				 */
				this.receivesCampaign = num(parsed, tag) == 1;
				break;

			case 'TGCANRECRUIT':
				/**
				 * Whether or not the nation will receive a recruitment telegram.
				 * @type boolean
				 * @see {@linkcode NationShard.TG_RECRUITABLE}
				 */
				this.receivesRecruit = num(parsed, tag) == 1;
				break;

			case 'TYPE':
				/**
				 * National pretitle of the nation.
				 * @type string
				 * @see {@linkcode NationShard.PRETITLE}
				 */
				this.pretitle = txt(parsed, tag);
				break;

			case 'UNSTATUS':
				/**
				 * {@linkcode WAStatus} of the nation.
				 * @type string
				 * @see {@linkcode NationShard.WA_STATUS}
				 */
				this.waStatus = txt(parsed, tag);
				break;

			case 'VERIFY':
				/**
				 * Whether or not the login verification on the nation was successful.
				 * @type boolean
				 */
				this.verified = num(parsed, tag) == 1;
				break;


			/* === Primitives with duplicate tags === */

			case 'CAPITAL':
				if(shards.includes(NationShard.CAPITAL)) {
					/**
					 * Name of the nation's capital.
					 * @type string
					 * @see {@linkcode NationShard.CAPITAL}
					 */
					this.capital = txt(parsed, tag);
					if(shards.includes(NationShard.CUSTOM_CAPITAL))
						/**
						 * Custom name for the nation's capital, if set.
						 * @type string
						 * @see {@linkcode NationShard.CUSTOM_CAPITAL}
						 */
						this.capitalCustom = txt(parsed, tag, 1) || null;
				} else this.capitalCustom = txt(parsed, tag) || null;
				break;
			case 'LEADER':
				if(shards.includes(NationShard.LEADER)) {
					/**
					 * Name of the nation's leader.
					 * @type string
					 * @see {@linkcode NationShard.LEADER}
					 */
					this.leader = txt(parsed, tag);
					if(shards.includes(NationShard.CUSTOM_LEADER))
						/**
						 * Custom name for the nation's capital, if set.
						 * @type string
						 * @see {@linkcode NationShard.CUSTOM_LEADER}
						 */
						this.leaderCustom = txt(parsed, tag, 1);
				} else this.leaderCustom = txt(parsed, tag);
				break;
			case 'RELIGION':
				if(shards.includes(NationShard.RELIGION)) {
					/**
					 * Name of the nation's national religion.
					 * @type string
					 * @see {@linkcode NationShard.RELIGION}
					 */
					this.religion = txt(parsed, tag);
					if(shards.includes(NationShard.CUSTOM_RELIGION))
						/**
						 * Custom name for the nation's capital, if set.
						 * @type string
						 * @see {@linkcode NationShard.CUSTOM_RELIGION}
						 */
						this.religionCustom = txt(parsed, tag, 1);
				} else this.religionCustom = txt(parsed, tag);
				break;


			/* === Complex Properties === */

			case 'CENSUS':
				/**
				 * List with the nation's performance on the requested {@linkcode CensusScale}s.
				 * @type CensusDataNation[]
				 * @see {@linkcode NationShard.CENSUS}
				 */
				this.census = handleList(parsed[tag][0], parseCensusNation);
				break;

			case 'DEATHS':
				/**
				 * Details on the different causes of death in the nation.
				 * @type DeathData
				 * @see {@linkcode NationShard.DEATHS}
				 */
				this.deaths = handleList(parsed[tag][0], parseDeath);
				break;

			case 'DISPATCHLIST':
				/**
				 * List of all extant dispatches the nation authored.
				 * @type ListDispatch[]
				 * @see {@linkcode NationShard.DISPATCH_LIST}
				 */
				this.dispatchList = handleList(parsed[tag][0], parseDispatchOverview);
				break;

			case 'FACTBOOKLIST':
				/**
				 * List of all extant factbooks the nation authored.
				 * @type ListDispatch[]
				 * @see {@linkcode NationShard.FACTBOOK_LIST}
				 */
				this.factbookList = handleList(parsed[tag][0], parseDispatchOverview);
				break;

			case 'FREEDOM':
				/**
				 * Textual description of the levels of civil, economic, and political freedoms in
				 * the nation.
				 * @type FreedomsTextData
				 * @see {@linkcode NationShard.FREEDOM_DESCRIPTIONS}
				 */
				this.freedomDescriptions = handle(parsed[tag][0], parseFreedomsText);
				break;

			case 'FREEDOM':
				/**
				 * The nation's numerical score for civil, economic, and political freedoms.
				 * @type FreedomsScoreData
				 * @see {@linkcode NationShard.FREEDOM_SCORES}
				 */
				this.freedomValues = handle(parsed[tag][0], parseFreedomsValue);
				break;

			case 'GOVT':
				/**
				 * Details of the nation's government expenditure by field, in percentages.
				 * @type SpendingData
				 * @see {@linkcode NationShard.GOVERNMENT_EXPENDITURE}
				 */
				this.expenditure = handle(parsed[tag][0], parseSpending);
				break;

			case 'HAPPENINGS':
				/**
				 * List of the most recent happening events in the nation.
				 * @type Happening[]
				 * @see {@linkcode NationShard.HAPPENINGS}
				 */
				this.happenings = handleList(parsed[tag][0], parseHappening);
				break;

			case 'HDI':
				/**
				 * Details on the makeup of the nation's HDI score.
				 * @type HDIData
				 * @see {@linkcode NationShard.HDI}
				 */
				this.hdi = handle(parsed, parseHDI);
				break;
	
			case 'ISSUES':
				/**
				 * List of all issues currently confronting the nation.
				 * @type Issue[]
				 * @see {@linkcode NationPrivateShard.ISSUES}
				 */
				this.issues = handleList(parsed[tag][0], parseIssue);
				break;

			case 'ISSUESUMMARY':
				/**
				 * List with the titles and IDs of all issues currently confronting the nation.
				 * @type ListIssue[]
				 * @see {@linkcode NationPrivateShard.ISSUES_SUMMARY}
				 */
				this.issuesSummaries = handleList(parsed[tag][0], parseSummary);
				break;

			case 'NOTICES':
				/**
				 * List of the nation's notices.
				 * @type Notice[]
				 * @see {@linkcode NationPrivateShard.NOTICE}
				 */
				this.notices = handleList(parsed[tag][0], parseNotice);
				break;

			case 'POLICIES':
				/**
				 * List of all policies in force in the nation.
				 * @type Policy[]
				 * @see {@linkcode NationShard.POLICIES}
				 */
				this.policies = handleList(parsed[tag][0], parsePolicy);
				break;

			case 'RCENSUS':
				/**
				 * Rank of the nation on the featured {@linkcode CensusScale} among region-mates.
				 * @type CensusRankUnscored
				 * @see {@linkcode NationShard.CENSUS_RANK_REGION}
				 */
				this.censusRankRegion = handle(parsed[tag][0], parseCensusRankUnscored);
				break;

			case 'SECTORS':
				/**
				 * Details on the makeup of the nation's GDP by sector.
				 * @type SectorsData
				 * @see {@linkcode NationShard.SECTORS}
				 */
				this.sectors = handle(parsed[tag][0], parseSectors);
				break;

			case 'UNREAD':
				/**
				 * Details on how many unread RMB and News posts, telegrams, and notices, as well
				 * as unanswered issues and WA resolutions yet to cast a vote on the nation has.
				 * @type UnreadsData
				 * @see {@linkcode NationPrivateShard.UNREADS}
				 */
				this.unreads = handle(parsed[tag][0], parseUnreads);
				break;

			case 'WABADGES':
				/**
				 * List of all commendation and condemnation badges the nation has.
				 * @type WABadge[]
				 * @see {@linkcode NationShard.WA_BADGES}
				 */
				this.badges = handleList(parsed[tag][0], parseBadge);
				break;

			case 'WCENSUS':
				/**
				 * Rank of the nation on the featured {@linkcode CensusScale}.
				 * @type CensusRankUnscored
				 * @see {@linkcode NationShard.CENSUS_RANK}
				 */
				this.censusRank = handle(parsed[tag][0], parseCensusRankUnscored);
				break;

			case 'ZOMBIE':
				/**
				 * Details on the nation's Z-Day performance.
				 * @type ZombieDataNation
				 * @see {@linkcode NationShard.ZOMBIE}
				 */
				this.zombie = handle(parsed[tag][0], parseZombieNation);
				break;
		}
	}
}

exports.Nation = Nation;
exports.NationRequest = NationRequest;
