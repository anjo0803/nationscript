/**
 * The Shards module provides enum types for the different shardable types of shardable requests.
 * @module shards
 * @license {@linkplain https://mozilla.org/MPL/2.0/ MPL-2.0}
 */

/**
 * Valid shards to query in requests to the (individual) cards endpoint of the API.
 * @enum {string}
 * @readonly
 */
exports.CardDetailShard = {
	/** Get the data of the nation depicted on the card. */
	INFO: 'info',

	/** Get the active asks and bids (markets) on the card. */
	MARKETS: 'markets',

	/** Get the names of the nations currently owning a copy of the card. */
	OWNERS: 'owners',

	/** Get a list of all transfers of the card from one nation to another, by gift or auction. */
	TRADES: 'trades'
};

/**
 * Valid shards to query in requests to the (deck/world) cards endpoint of the API.
 * 
 * **Note: Querying multiple at once can cause the request to load slightly longer than usual.**
 * @enum {string}
 * @readonly
 */
exports.CardShard = {
	/** Get all current asks and bids (markets) of a defined nation. */
	ASKS_BIDS: 'asksbids',

	/** Get a list of currently ongoing auctions. */
	AUCTIONS: 'auctions',

	/** Get a list of all trading cards in the deck of a defined nation. */
	CARDS: 'deck',

	/** Get a list of all trading cards in a defined collection. */
	COLLECTION_DETAILS: 'collection',

	/** Get a list of all collections of a defined nation. */
	COLLECTIONS: 'collections',

	/** Get aggregate info on the deck of a defined nation. */
	DECK_SUMMARY: 'info',

	/** Get a list of all transfers of cards from one nation to another, gift or auction. */
	TRADES: 'trades'
};

/**
 * Valid shards to query in requests to the nations endpoint of the API.
 * @enum {string}
 * @readonly
 */
exports.NationShard = {
	/** Get a random admirable the nation is eligible for, e.g. 'environmentally stunning'. */
	ADMIRABLE: 'admirable',

	/** Get the full list of admirables the nation is eligible for. */
	ADMIRABLES: 'admirables',

	/** Get the nation's national animal. */
	ANIMAL: 'animal',

	/** Get the behaviour of the nation's national animal, e.g. 'frolics freely in the nation's many lush forests'. */
	ANIMAL_TRAIT: 'animaltrait',

	/** Get the code of the nation's primary banner, if one is set, otherwise that of a random one the nation has. */
	BANNER: 'banner',

	/** Get a list with all banner codes for the banners the nation has unlocked. */
	BANNERS: 'banners',

	/** Get the name of the nation's capital. */
	CAPITAL: 'capital',

	/** Get the nation's national classification, e.g. 'New York Times Democracy'. */
	CATEGORY: 'category',

	/** Get the nation's performance - e.g. score, rank, historical development - on a World Census scale. */
	CENSUS: 'census',

	/** Get the nation's world-wide rank on today's featured World Census scale. */
	CENSUS_RANK: 'wcensus',

	/** Get the nation's region-wide rank on today's featured World Census scale. */
	CENSUS_RANK_REGION: 'rcensus',

	/** Get a full textual description for the nation's level of crime. */
	CRIME: 'crime',

	/** Get the name of the nation's currency. */
	CURRENCY: 'currency',

	/** Get the custom name of the nation's capital; if one is set, this is equal to the {@linkcode NationShard.CAPITAL} shard. */
	CUSTOM_CAPITAL: 'customcapital',

	/** Get the custom name of the nation's leader; if one is set, this is equal to the {@linkcode NationShard.LEADER} shard. */
	CUSTOM_LEADER: 'customleader',

	/** Get the custom name of the nation's religion; if one is set, this is equal to the {@linkcode NationShard.RELIGION} shard. */
	CUSTOM_RELIGION: 'customreligion',

	/** Get the ID of the nation in the NationStates database. The ID corresponds to the nation's card ID. */
	DATABASE_ID: 'dbid',

	/** Get a breakdown of the different causes of death in the nation. */
	DEATHS: 'deaths',

	/** Get the nation's adjective demonym. */
	DEMONYM_ADJECTIVE: 'demonym',

	/** Get the nation's noun demonym. */
	DEMONYM_NOUN: 'demonym2',

	/** Get the nation's noun demonym in plural form. */
	DEMONYM_NOUN_PLURAL: 'demonym2plural',

	/** Get the number of dispatches the nation has published. This includes factbooks. */
	DISPATCHES: 'dispatches',

	/** Get a list with basic information on the nation's published dispatches. This includes factbooks. */
	DISPATCH_LIST: 'dispatchlist',

	/** Get a list with the names of all nations currently endorsing the nation. */
	ENDORSEMENTS: 'endorsements',

	/** Get the number of factbooks the nation has published. */
	FACTBOOKS: 'factbooks',

	/** get a list with basic information on the nation's published factbooks. */
	FACTBOOK_LIST: 'factbooklist',

	/** Get the Unix epoch timestamp of when the nation first logged in. */
	FIRST_LOGIN: 'firstlogin',

	/** Get the (absolute) URL of the nation's flag. */
	FLAG: 'flag',

	/** Get a textual description of the nation's founding date relative to today, e.g. '1 year 234 days ago'. */
	FOUNDED: 'founded',

	/** Get the Unix epoch timestamp for when the nation was founded. */
	FOUNDED_TIME: 'foundedtime',

	/**
	 * Get the statuses of the nation's civil rights, economy, and political freedom scores, e.g. 'Good'.
	 * @deprecated in favor of `FREEDOM_DESCRIPTIONS` for distinction to `FREEDOM_SCORES`.
	 */
	FREEDOM: 'freedom',

	/** Get text descriptions of the nation's civil rights, economy, and political freedom scores, e.g. 'Good'. */
	FREEDOM_DESCRIPTIONS: 'freedom',

	/** Get the numerical values of the nation's civil rights, economy, and political freedom scores. */
	FREEDOM_SCORES: 'freedomscores',

	/** Get the nation's full name - 'The [pretitle] of [name]'. */
	FULL_NAME: 'fullname',

	/** Get the nations GDP score. */
	GDP: 'gdp',

	/** Get a full textual description of the nation's government. */
	GOVERNMENT_DESCRIPTION: 'govtdesc',

	/** Get the name of the expenditure sector on which the nation is spending the most. */
	GOVERNMENT_PRIORITY: 'govtpriority',

	/** Get a full breakdown of the nation's governmental expenditure by sector. */
	GOVERNMENT_EXPENDITURE: 'govt',

	/** Get the ten most recent happening events for the nation. */
	HAPPENINGS: 'happenings',

	/** [Undocumented] Get the base values for the calculation of the nation's HDI score. */
	HDI: 'hdi',

	/** Get the average income of the nation's citizens. */
	INCOME: 'income',

	/** Get the average income of the nation's poorest 10% of citizens. */
	INCOME_POOREST: 'poorest',

	/** Get the average income of the nation's richest 10% of citizens. */
	INCOME_RICHEST: 'richest',

	/** Get a full textual description of the nation's economy. */
	INDUSTRY_DESCRIPTION: 'industrydesc',

	/** Get the nation's influence rank, e.g. 'Apprentice'. */
	INFLUENCE: 'influence',

	/** Get the total number of issues answered by the nation. */
	ISSUES_ANSWERED: 'answered',

	/** Get a textual description of the nation's last login relative to now, e.g. '1 hour ago'. */
	LAST_LOGIN: 'lastactivity',

	/** Get the Unix epoch timestamp of when the nation last logged in. */
	LAST_LOGIN_TIME: 'lastlogin',

	/** Get the name of the nation's leader. */
	LEADER: 'leader',

	/** Get the effect lines of the last four issues answered by the nation. */
	LEGISLATION: 'legislation',

	/** Get the name of the nation's largest industrial sector. */
	MAJOR_INDUSTRY: 'majorindustry',

	/** Get the nation's national motto. */
	MOTTO: 'motto',

	/** Get the nation's (authentically capitalized) name. */
	NAME: 'name',

	/** Get a textual representation of three random things the nation is notable for. */
	NOTABLE: 'notable',

	/** Get a list with all things the nation is notable for, e.g. 'museums and concert halls'. */
	NOTABLES: 'notables',

	/** Get a list with the full details of all policies currently in effect within the nation. */
	POLICIES: 'policies',

	/** Get the nation's population, in million citizens. */
	POPULATION: 'population',

	/** Get the nation's pretitle, e.g. 'Kingdom'. */
	PRETITLE: 'type',

	/** Get the percentage of the nation's GDP that is generated by government activity. TODO */
	PUBLIC_SECTOR: 'publicsector',

	/** Get the name of the region the nation currently resides in. */
	REGION: 'region',

	/** Get the name of the nation's national religion. */
	RELIGION: 'religion',

	/** Get a full breakdown of the nation's GDP by sector in percent. */
	SECTORS: 'sectors',

	/** Get a list of all current citizen traits of the nation, e.g. 'devout'. */
	SENSIBILITIES: 'sensibilities',

	/** Get the current average income tax rate of the nation. */
	TAX: 'tax',

	/** Check whether the nation would currently receive a recruitment telegram. A theoretical sender region may be provided additionally. */
	TG_RECRUITABLE: 'tgcanrecruit',

	/** Check whether the nation would currently receive a WA campaign telegram. */
	TG_CAMPAIGNABLE: 'tgcancampaign',

	/** Get the nation's current status as WA Delegate, member state, or non-member. */
	WA_STATUS: 'wa',

	/** Gets the types and corresponding SC resolution IDs of all commendations and condemnations active on the nation. */
	WA_BADGES: 'wabadges',

	/** Get the nation's current stance on the at-vote GA resolution. */
	VOTE_GA: 'gavote',

	/** Get the nation's current stance on the at-vote SC resolution. */
	VOTE_SC: 'scvote',

	/** Get the nation's current number of zombies, survivors, and dead citizens, as well as its intended and actual response behaviour. */
	ZOMBIE: 'zombie'
};

/**
 * Valid shards to query in requests to the nations endpoint of the API.
 * If private shards are requested, the request must authenticate as the respective nation.
 * @enum {string}
 * @readonly
 */
exports.NationPrivateShard = {
	/** Get a list with the names of all nations currently saved in the nation's dossier. */
	DOSSIER_NATIONS: 'dossier',

	/** Get a list with the names of all regions currently saved in the nation's dossier. */
	DOSSIER_REGIONS: 'rdossier',

	/** Get a list with the details of all issues currently confronting the nation. */
	ISSUES: 'issues',

	/** Get a list with the names and IDs of all issues currently confronting the nation. */
	ISSUES_SUMMARY: 'issuesummary',

	/** Get a textual description of when the nation will receive its next issue (e.g. 'in 1 hour'). */
	NEXT_ISSUE: 'nextissue',

	/** Get the Unix epoch timestamp for when the nation will receive its next issue. */
	NEXT_ISSUE_TIME: 'nextissuetime',

	/** Get a list of the nation's notices from the last 48 hours, but always all unread ones. An alternate time to display notices from can be set. */
	NOTICES: 'notices',

	/** Get the number of unopened trading card packs the nation currently possesses. */
	PACKS: 'packs',

	/** Simply login to the nation without querying anything else. */
	PING: 'ping',

	/** Get the current number of new WA resolutions at vote, unaddressed issues, and unread telegrams, notices, and RMB and news posts. */
	UNREADS: 'unread'
};

/**
 * Valid shards to query in requests to the regions endpoint of the API.
 * @enum {string}
 * @readonly
 */
exports.RegionShard = {
	/** Get a list with the names of all nations currently banned from the region. */
	BANLIST: 'banlist',

	/** Get the ID of the region's current banner. */
	BANNER: 'banner',

	/** Get the name of the nation that set the region's current banner. */
	BANNER_UPLOADER: 'bannerby',

	/** Get the (relative) path to the raw regional banner image. */
	BANNER_URL: 'bannerurl',

	/** Get the average score of all regional nations on a World Census scale. */
	CENSUS: 'census',

	/** Get the ranked leaderboard of all regional nations on a World Census scale, 20 nations at a time. */
	CENSUS_RANKS: 'censusranks',

	/** Get the ID of the region in the NationStates database. */
	DATABASE_ID: 'dbid',

	/** Get the name of the region's current WA Delegate. */
	DELEGATE: 'delegate',

	/** Get the officer powers granted to the region's WA Delegate. */
	DELEGATE_AUTHORITY: 'delegateauth',

	/** Get the number of votes the region's WA Delegate currently has in the WA. */
	DELEGATE_VOTE_WEIGHT: 'delegatevotes',

	/** Get a list with the IDs of the region's pinned dispatches. */
	DISPATCHES: 'dispatches',

	/** Get a list with the names of all extant embassies of the region, as well as those currently being constructed or withdrawn and invites. */
	EMBASSIES: 'embassies',

	/** Get the (absolute) path to the region's flag. */
	FLAG: 'flag',

	/** Get a description of the region's founding date relative to today (e.g. '1 year 234 days ago'). */
	FOUNDED: 'founded',

	/** Get the Unix epoch timestamp for when the region was founded. */
	FOUNDED_TIME: 'foundedtime',

	/** Get the name of the nation that originally founded the region. */
	FOUNDER: 'founder',

	/** Get the status of the region as either a Frontier or a Stronghold. */
	FRONTIER_STATUS: 'frontier',

	/** Get the name of the nation that is the region's current Governor. */
	GOVERNOR: 'governor',

	/** Get a list of the most recent nation founding, moving, and CTE, as well as regional admin happening events. */
	HAPPENINGS: 'happenings',

	/** Get a list of important historical happening events of the region. */
	HISTORY: 'history',

	/** Get the Unix epoch timestamp for when the region last updated. */
	LAST_UPDATE: 'lastupdate',

	/** Get the Unix epoch timestamp for the last major update of the region. */
	LAST_UPDATE_MAJOR: 'lastmajorupdate',

	/** Get the Unix epoch timestamp for the last minor update of the region. */
	LAST_UPDATE_MINOR: 'lastminorupdate',

	/** Get the (correctly capitalised) name of the region. */
	NAME: 'name',

	/** Get a list with the names of all nations currently residing in the region. */
	NATIONS: 'nations',

	/** Get the total number of nations currently residing in the region. */
	NUM_NATIONS: 'numnations',

	/** Get the total number of WA member nations currently residing in the region. */
	NUM_WA_MEMBERS: 'numwanations',

	/** Get a list with the appointment and authority details of all current officers of the region. */
	OFFICERS: 'officers',

	/** Get the details of the region's current poll, if there is one. */
	POLL: 'poll',

	/** Get the overall regional influence level. */
	POWER: 'power',

	/** Get the region's policy regarding the ability to post to its RMB through a regional embassy. */
	RMB_CROSSPOSTING_POLICY: 'embassyrmb',

	/** Get a list of the 10 most recent RMB messages in the region. Additional parameters can be set to search for more and older messages. */
	RMB_MESSAGES: 'messages',

	/**
	 * [Undocumented] Get the names of nations that have made the most posts to the region's RMB.
	 * 
	 * **Note: This shard may cause a significantly longer waiting time until the API responds.**
	 */
	RMB_MOST_POSTS: 'mostposts',

	/**
	 * [Undocumented] Get the names of nations that have *given out* the most likes on the region's RMB.
	 * 
	 * **Note: This shard may cause a significantly longer waiting time until the API responds.**
	 */
	RMB_MOST_LIKES: 'mostlikes',

	/**
	 * [Undocumented] Get the names of nations that have *received* the most likes on the region's RMB.
	 * 
	 * **Note: This shard may cause a significantly longer waiting time until the API responds.**
	 */
	RMB_MOST_LIKED: 'mostliked',

	/** Get a list of all tags currently set for this region. */
	TAGS: 'tags',

	/** Get the number of votes for and against the current GA proposal from nations residing in the region. */
	VOTE_GA: 'gavote',

	/** Get the number of votes for and against the current SC proposal from nations residing in the region. */
	VOTE_SC: 'scvote',

	/** Gets the types and corresponding SC resolution IDs of all commendations, condemnations, liberations, and injunctions active on the region. */
	WA_BADGES: 'wabadges',

	/** Get a list with the names of all WA member nations residing in the region. */
	WA_MEMBERS: 'wanations',

	/** Get the current text of the region's World Factbook Entry. */
	WFE: 'factbook',

	/** Get the total current number of zombies, survivors, and dead citizens from among nations residing in the region. */
	ZOMBIE: 'zombie'
};

/**
 * Valid shards to query in requests to the WA endpoint of the API.
 * @enum {string}
 * @readonly
 */
exports.WAShard = {
	/** Get a list with the names of all current WA Delegate nations. */
	DELEGATES: 'delegates',

	/** Get a list of all effective Delegate votes, including their respective voting power and time of having voted. */
	DELEGATE_VOTES: 'delvotes',

	/** Get a complete log of each time a Delegate cast, withdrew, or changed their vote. */
	DELEGATE_VOTE_LOG: 'dellog',

	/** Get a list of the most recent happening events relating to Delegacy changes, proposal submissions/withdrawals/fails, and voting results. */
	HAPPENINGS: 'happenings',

	/** Get info about the result of the most recently concluded vote. */
	LAST_RESOLUTION: 'lastresolution',

	/** Get a list with the names of all current WA member nations. */
	MEMBERS: 'members',

	/** Get the total number of current WA Delegates. */
	NUM_DELEGATES: 'numdelegates',

	/** Get the total number of current WA member nations. */
	NUM_MEMBERS: 'numnations',

	/** Get a list of all currently submitted proposals. */
	PROPOSALS: 'proposals',

	/** Get information about the resolution that is currently at vote. Alternatively, get information about a historical WA resolution. */
	RESOLUTION: 'resolution',

	/** Get the names and votes of all nations that have cast a vote on the resolution currently at vote. */
	VOTERS: 'voters',

	/** Get a list of the vote totals on the resolution currently at vote for each hour since voting started. */
	VOTE_TRACK: 'votetrack'
};

/**
 * Valid shards to query in requests to the world endpoint of the API.
 * @enum {string}
 * @readonly
 */
exports.WorldShard = {
	/** Get the names and unlocking requirements for a defined list of national banners. */
	BANNER: 'banner',

	/** Get the average score of all nations on a World Census scale. */
	CENSUS: 'census',

	/** Get the ID of today's featured World Census scale. */
	CENSUS_ID: 'censusid',

	/** Get the description of a World Census scale. */
	CENSUS_DESCRIPTION: 'censusdesc',

	/** Get the name for the ranked leaderboard of a World Census scale, e.g. 'Most Politically Free'. */
	CENSUS_NAME: 'censusname',

	/** Get the ranked leaderboard of all nations on a World Census scale, 20 nations at a time. */
	CENSUS_RANKS: 'censusranks',

	/** Get the name of the scale of a World Census scale, e.g. 'milliStalins'. */
	CENSUS_SCALE: 'censusscale',

	/** Get the name of a World Census Scale, e.g. 'Civil Rights'. */
	CENSUS_TITLE: 'censustitle',

	/** Get the raw BBCode of a dispatch. */
	DISPATCH: 'dispatch',

	/** Get a list with the basic data of the 20 currently trending dispatches. Additional parameters can refine the search criteria. */
	DISPATCH_LIST: 'dispatchlist',

	FACTION: 'faction',
	FACTION_LIST: 'factions',

	/** Get the name of today's featured region. */
	FEATURED_REGION: 'featuredregion',

	/** Get a list of the most recent happening events in the world. Additional parameters can set filter criteria. */
	HAPPENINGS: 'happenings',

	/** Get the ID of the most recent happening event. */
	LAST_EVENT_ID: 'lasteventid',

	/** Get a list with the names of all currently existing nations. */
	NATIONS: 'nations',

	/** Get a list with the fifty most recently founded nations' names. */
	NEW_NATIONS: 'newnations',

	/** [Undocumented] Get a list of the fifty most recently founded nations, including their names, region of origin, and time of founding. */
	NEW_NATIONS_DETAILS: 'newnationdetails',

	/** Get the total number of nations that currently exist. */
	NUM_NATIONS: 'numnations',

	/** Get the total number of regions that currently exist. */
	NUM_REGIONS: 'numregions',

	/** Get details about a regional poll. */
	POLL: 'poll',

	/** Get a list with the names of all currently existing regions. */
	REGIONS: 'regions',

	/** Get a list with the names of all regions that have and/or don't have specified tags. */
	REGIONS_BY_TAG: 'regionsbytag',

	/** Get the number of telegrams currently waiting to be delivered in the manual, API, and stamp queues. */
	TG_QUEUE: 'tgqueue'
};
