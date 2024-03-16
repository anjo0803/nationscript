/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Admirable traits of a nation.
 * @enum {string}
 * @readonly
 * @todo These are all I found with a quick search, there might be more.
 */
exports.Admirable = {
	CULTURED: 'cultured',
	EFFICIENT: 'efficient',
	ENVIRONMENT: 'environmentally stunning',
	GENIAL: 'genial',
	ORDERLY: 'orderly',
	PROGRESSIVE: 'socially progressive',
	SAFE: 'safe'
};

/**
 * Valid display modes for the results of the various `census` shards.
 * @enum {string}
 * @readonly
 */
exports.CensusMode = {
	/** Get the raw score. */
	SCORE: 'score',
	/** Get the rank of the nation, only considering other regional nations. */
	RANK_REGION: 'rrank',
	/** Get the percentile of the nation, only considering other regional nations. */
	RANK_REGION_PERCENT: 'prrank',
	/** Get the rank of the nation or region. */
	RANK_WORLD: 'rank',
	/** Get the percentile of the nation or region. */
	RANK_WORLD_PERCENT: 'prank'
};

/**
 * IDs of World Census scales.
 * @enum {number}
 * @readonly
 */
exports.CensusScale = {
	CIVIL_RIGHTS: 0,
	ECONOMY: 1,
	POLITICAL_FREEDOM: 2,
	POPULATION: 3,
	WEALTH_GAPS: 4,
	DEATH_RATE: 5,
	COMPASSION: 6,
	ECO_FRIENDLINESS: 7,
	SOCIAL_CONSERVATISM: 8,
	NUDITY: 9,
	INDUSTRY_AUTOMOBILE: 10,
	INDUSTRY_CHEESE: 11,
	INDUSTRY_BASKET: 12,
	INDUSTRY_IT: 13,
	INDUSTRY_PIZZA: 14,
	INDUSTRY_TROUT: 15,
	INDUSTRY_ARMS: 16,
	SECTOR_AGRICULTURE: 17,
	INDUSTRY_BEVERAGE: 18,
	INDUSTRY_TIMBER: 19,
	INDUSTRY_MINING: 20,
	INDUSTRY_INSURANCE: 21,
	INDUSTRY_FURNITURE: 22,
	INDUSTRY_RETAIL: 23,
	INDUSTRY_BOOK: 24,
	INDUSTRY_GAMBLING: 25,
	SECTOR_MANUFACTURING: 26,
	GOVERNMENT_SIZE: 27,
	WELFARE: 28,
	PUBLIC_HEALTHCARE: 29,
	LAW_ENFORCEMENT: 30,
	BUSINESS_SUBSIDIZATION: 31,
	RELIGIOUSNESS: 32,
	INCOME_EQUALITY: 33,
	NICENESS: 34,
	RUDENESS: 35,
	INTELLIGENCE: 36,
	IGNORANCE: 37,
	POLITICAL_APATHY: 38,
	HEALTH: 39,
	CHEERFULNESS: 40,
	WEATHER: 41,
	COMPLIANCE: 42,
	SAFETY: 43,
	LIFESPAN: 44,
	IDEOLOGICAL_RADICALITY: 45,
	DEFENSE_FORCES: 46,
	PACIFISM: 47,
	ECONOMIC_FREEDOM: 48,
	TAXATION: 49,
	FREEDOM_FROM_TAXATION: 50,
	CORRUPTION: 51,
	INTEGRITY: 52,
	AUTHORITARIANISM: 53,
	YOUTH_REBELLIOUSNESS: 54,
	CULTURE: 55,
	EMPLOYMENT: 56,
	PUBLIC_TRANSPORT: 57,
	TOURISM: 58,
	WEAPONIZATION: 59,
	RECREATIONAL_DRUG_USE: 60,
	OBESITY: 61,
	SECULARISM: 62,
	ENVIRONMENTAL_BEAUTY: 63,
	CHARMLESSNESS: 64,
	INFLUENCE: 65,
	WORLD_ASSEMBLY_ENDORSEMENTS: 66,
	AVERAGENESS: 67,
	HUMAN_DEVELOPMENT_INDEX: 68,
	PRIMITIVENESS: 69,
	SCIENTIFIC_ADVANCEMENT: 70,
	INCLUSIVENESS: 71,
	AVERAGE_INCOME: 72,
	AVERAGE_INCOME_POOR: 73,
	AVERAGE_INCOME_RICH: 74,
	PUBLIC_EDUCATION: 75,
	ECONOMIC_OUTPUT: 76,
	CRIME: 77,
	FOREIGN_AID: 78,
	BLACK_MARKET: 79,
	RESIDENCY: 80,
	SURVIVORS: 81,
	ZOMBIES: 82,
	DEAD: 83,
	ZOMBIES_PERCENT: 84,
	AVERAGE_DISPOSABLE_INCOME: 85,
	INTERNATIONAL_ARTWORK: 86,
	PATRIOTISM: 87,
	FOOD_QUALITY: 88,

	/** **Works for regions only!** */
	REGION_ALPHABET: 254,
	/** **Works for regions only!** */
	REGION_POPULATION: 255
};

/**
 * Policies on RMB posting privileges for residents of embassy regions.
 * @enum {string}
 * @readonly
 */
exports.CrosspostingPolicy = {
	/** No RMB cross-posting from embassy regions allowed. */
	NONE: '0',
	/** Only Founders and WA Delegates of embassy regions may cross-post. */
	DELEGATES_AND_FOUNDERS: 'con',
	/** Only ROs of embassy regions may cross-post. */
	OFFICERS: 'off',
	/** Only ROs with the {@linkcode OfficerAuthority.COMMS} in embassy regions may cross-post. */
	OFFICERS_WITH_COMMS: 'com',
	/** All nations in embassy regions may cross-post. */
	EVERYONE: 'all'
};

/**
 * Types of causes of death in a nation.
 * @enum {string}
 * @readonly
 */
exports.DeathCause = {
	ACCIDENT: 'Accident',
	ANIMAL_ATTACK: 'Animal Attack',
	AGE: 'Old Age',
	BUNGEE_JUMPING: 'Bungee Jumping',
	CANCER: 'Cancer',
	CAPITAL_PUNISHMENT: 'Capital Punishment',
	DISAPPEARANCE: 'Disappearance',
	EUTHANASIA: 'Involuntary Euthanasia',
	EXPOSURE: 'Exposure',
	GOD: 'Acts of God',
	HEART_DISEASE: 'Heart Disease',
	MALNOURISHMENT: 'Malnourishment',
	MURDER: 'Murder',
	SACRIFICE: 'Ritual Sacrifice',
	SCURVY: 'Scurvy',
	SHUTTLE_MISHAP: 'Space Shuttle Mishap',
	SPILL: 'Nuclear Spill',
	SUICIDE: 'Suicide While in Police Custody',
	SUNBURN: 'Sunburn',
	VAT_LEAKAGE: 'Vat Leakage',
	WAR: 'War',
	WILDERNESS: 'Lost in Wilderness',
	WORK: 'Work'
};

/**
 * Top-level categories of dispatches.
 * @enum {string}
 */
exports.DispatchCategory = {
	FACTBOOK: 'Factbook',
	BULLETIN: 'Bulletin',
	ACCOUNT: 'Account',
	META: 'Meta'
};

/**
 * Sub-categories of dispatches.
 * @enum
 * @readonly
 */
exports.DispatchSubcategory = {
	FACTBOOK: {
		OVERVIEW: `${this.DispatchCategory.FACTBOOK}:Overview`,
		HISTORY: `${this.DispatchCategory.FACTBOOK}:History`,
		GEOGRAPHY: `${this.DispatchCategory.FACTBOOK}:Geography`,
		CULTURE: `${this.DispatchCategory.FACTBOOK}:Culture`,
		POLITICS: `${this.DispatchCategory.FACTBOOK}:Politics`,
		LEGISLATION: `${this.DispatchCategory.FACTBOOK}:Legislation`,
		RELIGION: `${this.DispatchCategory.FACTBOOK}:Religion`,
		MILITARY: `${this.DispatchCategory.FACTBOOK}:Military`,
		ECONOMY: `${this.DispatchCategory.FACTBOOK}:Economy`,
		INTERNATIONAL: `${this.DispatchCategory.FACTBOOK}:International`,
		TRIVIA: `${this.DispatchCategory.FACTBOOK}:Trivia`,
		MISCELLANEOUS: `${this.DispatchCategory.FACTBOOK}:Miscellaneous`
	},
	BULLETIN: {
		POLICY: `${this.DispatchCategory.BULLETIN}:Policy`,
		NEWS: `${this.DispatchCategory.BULLETIN}:News`,
		OPINION: `${this.DispatchCategory.BULLETIN}:Opinion`,
		CAMPAIGN: `${this.DispatchCategory.BULLETIN}:Campaign`
	},
	ACCOUNT: {
		MILITARY: `${this.DispatchCategory.ACCOUNT}:Military`,
		TRADE: `${this.DispatchCategory.ACCOUNT}:Trade`,
		SPORT: `${this.DispatchCategory.ACCOUNT}:Sport`,
		DRAMA: `${this.DispatchCategory.ACCOUNT}:Drama`,
		DIPLOMACY: `${this.DispatchCategory.ACCOUNT}:Diplomacy`,
		SCIENCE: `${this.DispatchCategory.ACCOUNT}:Science`,
		CULTURE: `${this.DispatchCategory.ACCOUNT}:Culture`,
		OTHER: `${this.DispatchCategory.ACCOUNT}:Other`
	},
	META: {
		GAMEPLAY: `${this.DispatchCategory.META}:Gameplay`,
		REFERENCE: `${this.DispatchCategory.META}:Reference`
	}
};

/**
 * Valid sorting modes when querying dispatches.
 * @enum {string}
 * @readonly
 */
exports.DispatchSearchMode = {
	/** Get recently-posted trending dispatches. */
	NEW: 'new',
	/** Get the all-time highest-scoring dispatches. */
	BEST: 'best'
};

/**
 * Valid filters when querying one of the `HAPPENINGS` shards.
 * @enum {string}
 * @readonly
 */
exports.HappeningsFilter = {
	/** Get Issues-answering activity. */
	LEGISLATION: 'law',
	/** Get changes in national settings, classifications, and new WA census badges. */
	NATION_CHANGES: 'change',
	/** Get dispatch posting activity. */
	DISPATCHES: 'dispatch',
	/** Get activity relating to maps or map versions being created. */
	MAPS: 'maps',
	/** Get RMB posting activity. */
	RMB: 'rmb',
	/** Get embassy proposals, agreement or rejection of them, and orders to close them. */
	EMBASSIES: 'embassy',
	/** Get ejecting and (un-)banning activity. */
	BORDER_CONTROL: 'eject',
	/** Get WFE and flag changes, dispatch (un-)pins, and RO appointments in regions. */
	REGION_ADMIN: 'admin',
	/** Get nation relocations. */
	MOVEMENT: 'move',
	/** Get nation foundings. */
	FOUNDING: 'founding',
	/** Get nation CTEs. */
	CTE: 'cte',
	/** Get WA votes being cast. */
	WA_VOTES: 'vote',
	/** Get submissions, withdrawals, and promotions of, as well as new approvals on proposals. */
	WA_PROPOSALS: 'resolution',
	/** Get WA application, admittance, and resignation happenings. */
	WA_MEMBERSHIP: 'member',
	/** Get endorsement-giving and -withdrawing activity. */
	ENDORSEMENTS: 'endo'
};

/**
 * Influence ranks a nation can achieve in a region, in ascending order.
 * @enum {string}
 * @readonly
 */
exports.Influence = [
	'Zero',
	'Unproven',
	'Hatchling',
	'Newcomer',
	'Nipper',
	'Minnow',
	'Sprat',
	'Shoeshiner',
	'Page',
	'Squire',
	'Apprentice',
	'Vassal',
	'Truckler',
	'Handshaker',
	'Duckspeaker',
	'Envoy',
	'Diplomat',
	'Ambassador',
	'Auxiliary',
	'Negotiator',
	'Contender',
	'Instigator',
	'Dealmaker',
	'Enforcer',
	'Eminence Grise',
	'Powerbroker',
	'Power',
	'Superpower',
	'Dominator',
	'Hegemony',
	'Hermit'
];

/**
 * Special characteristics notable about a nation.
 * @enum {string}
 * @readonly
 */
exports.Notable = {
	NONE: 'burgeoning @@ANIMAL@@ population',

	ANTI_SMOKING: 'anti-smoking policies',
	AVERSION: 'aversion to nipples',
	CAR_BAN: 'ban on automobiles',
	CARS: 'spontaneously combusting cars',
	CHEESE_HATE: 'hatred of cheese',
	CINEMA: 'avant-garde cinema',
	CLOSED_BORDERS: 'closed borders',
	COMPUTERS: 'soft-spoken computers',
	CONSCRIPTION: 'compulsory military service',
	CURFEW: 'strictly enforced bedtime',
	DIGITAL_CURRENCY: 'digital currency',
	DINOSAURS: 'free-roaming dinosaurs',
	DRUGS: 'absence of drug laws',
	EXECUTIONS: 'frequent executions',
	FERAL_CHILDREN: 'feral children',
	FLOGGINGS: 'public floggings',
	GERONTOCIDE: 'disturbing lack of elderly people',
	GUNS: 'compulsory gun ownership',
	HEALTHCARE: 'national health service',
	HETERO: 'avowedly heterosexual populace',
	HOVERBOARDS: 'exploding hoverboards',
	INHOSPITABLE: 'barren, inhospitable landscape',
	MISSILE_SILOS: 'ubiquitous missile silos',
	MUSEUMS: 'museums and concert halls',
	NO_DIVORCE: 'zero percent divorce rate',
	NO_EDUCATION: 'complete lack of public education',
	NO_GUNS: 'restrictive gun laws',
	NO_PLANES: 'lack of airports',
	NO_PRISONS: 'complete lack of prisons',
	NO_SPEED_LIMIT: 'unlimited-speed roads',
	NO_WELFARE: 'complete absence of social welfare',
	NUCLEAR: 'sprawling nuclear power plants',
	NUDITY: 'enforced nudity',
	PANDEMICS: 'deadly medical pandemics',
	PARENTAL_LICENSING: 'parental licensing program',
	PETTING_ZOO: 'otherworldly petting zoo',
	PIRACY: 'rum-swilling pirates',
	PITH_HELMEST: 'pith helmet sales',
	PLAGIARISM: 'rampant corporate plagiarism',
	POETS: 'suspicion of poets',
	POLYGAMY: 'multi-spousal wedding ceremonies',
	PRAMS: 'triple-decker prams',
	PROHIBITION: 'prohibition of alcohol',
	PYLONS: 'conspicuous electricity pylons',
	REFERENDA: 'daily referendums',
	RELIGION_IRREVERENCE: 'irreverence towards religion',
	SACRIFICES: 'ritual sacrifices',
	SAFETY: 'stringent health and safety legislation',
	SELL_SWORDS: 'infamous sell-swords',
	SLAVES: 'enslaved workforce',
	SMUTTY_TV: 'smutty television',
	SOCIALIST: 'state-planned economy',
	SPACE: 'keen interest in outer space',
	TAXES: 'punitive income taxes',
	TECHNOPHOBIA: 'fear of technology',
	TEETOTAL: 'teetotalling pirates',
	VATS: 'vat-grown people',
	VEGETARIAN: 'compulsory vegetarianism',
	WASTE_DUMPING: 'flagrant waste-dumping',
	WELFARE: 'devotion to social welfare'
};

/**
 * Icons of NationStates notices.
 * @enum {string}
 * @readonly
 * @todo These are all I could identify, there might be more.
 */
exports.NoticeIcon = {
	BADGE: 'award-1',
	BELL: 'bell',
	BUILDING: 'building',
	MAIL: 'mail-alt',
	NEWSPAPER: 'newspaper',
	PERSON: 'male',
	RMB: 'stackexchange',
	SCALES: 'balance-scale',
	TROPHY: 'award',
	UNLOCK: 'lock-open',
	WA: 'wa'
}

/**
 * Types of NationStates notices.
 * @enum {string}
 * @readonly
 * @todo These are all I could identify, there might be more.
 */
exports.NoticeType = {
	BAD_LOGIN: 'PW',
	CARDS: 'C',
	CENSUS_RANK: 'T',
	DISPATCH_MENTION: 'D',
	EMBASSY: 'EMB',
	ENDORSEMENT_GAINED: 'END',
	ENDORSEMENT_LOST: 'UNEND',
	NEW_ISSUE: 'I',
	OFFICER: 'O',
	POLICY: 'P',
	RMB_LIKE: 'RMBL',
	RMB_QUOTE: 'RMBQ',
	RMB_QUOTE_DISPATCH: 'DQ',
	RMB_MENTION: 'RMB',
	TELEGRAM: 'TG',
	UNLOCK: 'U'
};

/**
 * Authority codes for the in-game authorities of Regional Officers.
 * @enum {string}
 * @readonly
 */
exports.OfficerAuthority = {
	/**
	 * Denotes that the officer may:
	 * * appoint and dismiss other Regional Officers, and
	 * * grant and take away their different authorities.
	 */
	EXECUTIVE: 'X',
	/**
	 * Denotes that the officer may establish and alter the
	 * list of successor nations to the Governor position.
	 */
	SUCCESSOR: 'S',
	/**
	 * Denotes that the officer may approve new WA proposals
	 * and has a weighted vote on WA resolutions.
	 */
	WA: 'W',
	/**
	 * Denotes that the officer may:
	 * * change the regional banner, flag, and WFE,
	 * * add and remove tags from the region, and
	 * * (un-)pin dispatches to/from the WFE.
	 */
	APPEARANCE: 'A',
	/**
	 * Denotes that the officer may:
	 * * eject and (un-)ban nations from the region, and
	 * * set, remove, and alter the regional password.
	 */
	BORDER_CONTROL: 'B',
	/**
	 * Denotes that the officer may:
	 * * set the regional welcome telegram,
	 * * send region-wide telegrams without needing telegram stamps, and
	 * * (un-)suppress messages on the region's RMB.
	 */
	COMMS: 'C',
	/**
	 * Denotes that the officer may:
	 * * open new and close existing embassies with other regions, and
	 * * set the region's embassy cross-posting policy.
	 */
	EMBASSIES: 'E',
	/** 
	 * Denotes that the officer may create and cancel regional polls.
	 */
	POLLS: 'P'
};

/**
 * Rarity categories of trading cards.
 * @enum {string}
 * @readonly
 */
exports.Rarity = {
	COMMON: 'common',
	UNCOMMON: 'uncommon',
	RARE: 'rare',
	ULTRA_RARE: 'ultra-rare',
	EPIC: 'epic',
	LEGENDARY: 'legendary'
};

/**
 * Categories for the reclassification of a nation's levels of freedom by an answer to an issue.
 * @enum {number}
 * @readonly
 */
exports.ReclassificationCategory = {
	CIVIL_RIGHTS: 0,
	ECONOMIC_FREEDOM: 1,
	POLITICAL_FREEDOM: 2
};

/**
 * Suppression status codes of RMB posts.
 * @enum {number}
 * @readonly
 */
exports.RMBPostStatus = {
	/** The post is displayed as usual. */
	OK: 0,
	/** The post has been suppressed by a Regional Officer, but can still be viewed. */
	SUPPRESSED_OFFICER: 1,
	/** The post has been self-deleted by the author and can't be viewed anymore. */
	DELETED: 2,
	/** The post has been suppressed by a NS Moderator and can't be viewed anymore. */
	SUPPRESSED_MOD: 9
};

/**
 * Possible sensibility traits of a nation's citizens.
 * @enum {string}
 * @readonly
 * @todo These are all I found with a quick search, there might be more.
 */
exports.Sensibility = {
	CHEERFUL: 'cheerful',
	COMPASSIONATE: 'compassionate',
	CYNICAL: 'cynical',
	DEMOCRATIC: 'democratic',
	DEVOUT: 'devout',
	HARD_NOSED: 'hard-nosed',
	HARD_WORKING: 'hard-working',
	HUMORLESS: 'humorless'
};

/**
 * Regional tags.
 * @enum {string}
 * @readonly
 */
exports.Tag = {
	NOT: '-',

	ANARCHIST: 'Anarchist',
	ANIME: 'Anime',
	ANTI_CAPITALIST: 'Anti-Capitalist',
	ANTI_COMMUNIST: 'Anti-Communist',
	ANTI_FASCIST: 'Anti-Fascist',
	ANTI_GA: 'Anti-General Assembly',
	ANTI_SC: 'Anti-Security Council',
	ANTI_WA: 'Anti-World Assembly',
	CAPITALIST: 'Capitalist',
	CASUAL: 'Casual',
	CATCHER: 'Catcher',
	CLASS: 'Class',
	COLONY: 'Colony',
	COMMENDED: 'Commended',
	COMMUNIST: 'Communist',
	CONDEMNED: 'Condemned',
	CONSERVATIVE: 'Conservative',
	CYBERPUNK: 'Cyberpunk',
	DEFENDER: 'Defender',
	DEMOCRATIC: 'Democratic',
	ECO_FRIENDLY: 'Eco-Friendly',
	EGALITARIAN: 'Egalitarian',
	EMBASSY_COLLECTOR: 'Embassy Collector',
	ENORMOUS: 'Enormous',
	FORUM_7: 'F7er',
	FANDOM: 'Fandom',
	FANTASY_TECH: 'Fantasy Tech',
	FASCIST: 'Fascist',
	FEATURED: 'Featured',
	FEEDER: 'Feeder',
	FEMINIST: 'Feminist',
	FOUNDERLESS: 'Founderless',
	FREE_TRADE: 'Free Trade',
	FRONTIER: 'Frontier',
	FUTURE_TECH: 'Future Tech',
	FT_FTL: 'FT: FTL',
	FT_FTLI: 'FT: FTLi',
	FT_STL: 'FT: STL',
	GAME_PLAYER: 'Game Player',
	GARGANTUAN: 'Gargantuan',
	GA: 'General Assembly',
	GENERALITE: 'Generalite',
	GOVERNORLESS: 'Governorless',
	HUMAN_ONLY: 'Human-Only',
	IMPERIALIST: 'Imperialist',
	INDEPENDENT: 'Independent',
	INDUSTRIAL: 'Industrial',
	INJUNCTED: 'Injuncted',
	INT_FED: 'International Federalist',
	INVADER: 'Invader',
	ISOLATIONIST: 'Isolationist',
	ISSUES_PLAYER: 'Issues Player',
	JUMP_POINT: 'Jump Point',
	LGBT: 'LGBT',
	LARGE: 'Large',
	LIBERAL: 'Liberal',
	LIBERATED: 'Liberated',
	LIBERTARIAN: 'Libertarian',
	MAGICAL: 'Magical',
	MAP: 'Map',
	MEDIUM: 'Medium',
	MERCENARY: 'Mercenary',
	MINUSCULE: 'Minuscule',
	MODERN_TECH: 'Modern Tech',
	MONARCHIST: 'Monarchist',
	MULTI_SPECIES: 'Multi-Species',
	NAT_SOV: 'National Sovereigntist',
	NEUTRAL: 'Neutral',
	NEW: 'New',
	NON_ENGLISH: 'Non-English',
	OFFSITE_CHAT: 'Offsite Chat',
	OFFSITE_FORUMS: 'Offsite Forums',
	OUTER_SPACE: 'Outer Space',
	P2TM: 'P2TM',
	PACIFIST: 'Pacifist',
	PARODY: 'Parody',
	PASSWORDED: 'Password',
	PAST_TECH: 'Past Tech',
	PATRIARCHAL: 'Patriarchal',
	POST_APOCALYPTIC: 'Post Apocalyptic',
	POST_MODERN_TECH: 'Post-Modern Tech',
	PUPPET_STORAGE: 'Puppet Storage',
	REGIONAL_GOVERNMENT: 'Regional Government',
	RELIGIOUS: 'Religious',
	RESTORER: 'Restorer',
	ROLEPLAYER: 'Role Player',
	SC: 'Security Council',
	SERIOUS: 'Serious',
	SILLY: 'Silly',
	SINKER: 'Sinker',
	SMALL: 'Small',
	SNARKY: 'Snarky',
	SOCIAL: 'Social',
	SOCIALIST: 'Socialist',
	SPORTS: 'Sports',
	STEAMPUNK: 'Steampunk',
	SURREAL: 'Surreal',
	THEOCRATIC: 'Theocratic',
	TOTALITARIAN: 'Totalitarian',
	TRADING_CARDS: 'Trading Cards',
	VIDEO_GAME: 'Video Game',
	WARZONE: 'Warzone',
	WA: 'World Assembly'
};

/**
 * Possible WA badges for nations and regions.
 * @enum {string}
 * @readonly
 */
exports.WABadgeType = {
	COMMENDATION: 'commend',
	CONDEMNATION: 'condemn',
	LIBERATION: 'liberate',
	INJUNCTION: 'injunct'
};

/**
 * @enum
 * @readonly
 * @todo Populate this thing
 */
exports.WACategory = {
	GA: {},
	SC: {}
};

/**
 * WA Council codes.
 * @enum {number}
 * @readonly
 */
exports.WACouncil = {
	/** General Assembly. */
	GA: 1,
	/** Security Council. */
	SC: 2
};

/**
 * Possible WA membership status codes.
 * @enum {string}
 * @readonly
 */
exports.WAStatus = {
	/** The nation isn't a WA member. */
	NONMEMBER: 'Non-member',
	/** The nation is a WA member. */
	MEMBER: 'WA Member',
	/** The nation is a WA member and the WA Delegate of their region. */
	DELEGATE: 'WA Delegate'
};

/**
 * Possible votes of nations on WA resolutions.
 * @enum {string}
 * @readonly
 */
exports.WAVote = {
	/** The nation has voted in favor of the resolution. */
	FOR: 'FOR',
	/** The nation has voted against the resolution. */
	AGAINST: 'AGAINST',
	/** The nation has not voted on the resolution yet. */
	UNDECIDED: 'UNDECIDED',
	/** There currently is no resolution at vote. */
	NONE_AT_VOTE: ''
};

/**
 * Possible responses of nations to the annual zombie apocalypse on Z-Day.
 * @enum {string}
 * @readonly
 */
exports.ZombieAction = {
	/** The nation hasn't made a decision on their response yet. */
	INACTION: 'none',
	/** The nation sends zombies to other nations in order to infect their populations. */
	EXPORT: 'export',
	/** The nation shoots and kills zombies. */
	EXTERMINATE: 'exterminate',
	/** The nation researches a cure in order to turn zombies back into normal citizens. */
	RESEARCH: 'research'
};
