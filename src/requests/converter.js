/**
 * @license
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	CensusScale,
	DeathCause,
	DispatchSubcategory,
	NoticeType,
	Rarity,
	ReclassificationCategory,
	RMBPostStatus,
	WABadgeType,
	WACategory,
	ZombieAction
} = require('../enums');


/* === Reading Results Of The XML Parser === */

/**
 * Extracts the textual value at the described position within the parsed XML, if one exists.
 * @param {object} obj The object returned by the XML parser from which to read an attribute.
 * @param {string} property Name of the desired attribute of `obj`.
 * @returns {string} The string value of the named attribute, or `undefined` if not found.
 */
function attr(obj, name) {
	return obj?.['$attrs']?.[name];
}

/**
 * Extracts the textual value at the described position within the parsed XML, if one exists.
 * @param {object} obj The object returned by the XML parser which to use as the base.
 * @param {string} property Name of the property of `obj` that should be used.
 * @param {number} index Index of the desired value within the property. The default is `0`.
 * @returns {string} The string value at the given position, or `null` if not found.
 */
function txt(obj, property, index = 0) {
	let x = obj?.[property];
	if(Array.isArray(x)) return x[index]?.toString().trim();
	else if(x) return x.toString().trim();
	else return null;
}

/**
 * Extracts the numerical value at the described position within the parsed XML, if one exists.
 * @param {object} obj The object returned by the XML parser which to use as the base.
 * @param {string} property Name of the property of `obj` that should be used.
 * @param {number} index Index of the desired value within the property. The default is `0`.
 * @returns {number} The numerical value at the given position, or `NaN` if not found.
 */
function num(obj, property, index = 0) {
	let val = txt(obj, property, index);
	if(/^\d+\.\d+$/.test(val)) return parseFloat(val);
	else if(/^\d+$/.test(val)) return parseInt(val);
	else return NaN;
}

/**
 * Extracts the array value at the described position within the parsed XML, if one exists.
 * @param {object} obj The object returned by the XML parser which to use as the base.
 * @param {string} property Name of the property of `obj` that should be used.
 * @param {number} index Index of the desired array within the property. The default is `0`.
 * @returns {any[]} The array of values at the given position, or `null` if not found.
 */
function arr(obj, property, index = 0) {
	let ret = obj?.[property];
	if(ret === undefined) return null;

	if(ret[index] === undefined) return [];
	else if(Array.isArray(ret[index])) return ret[index];
	else if(!Array.isArray(ret)) return [ret];
	else return ret;
	/* let ret = obj?.[property]?.[index];
	if(ret === undefined) return null;
	if(!Array.isArray(ret)) ret = [ret];
	return ret; */
}

/**
 * Checks whether the given value can be iterated over e.g. via `for`.
 * @param {any} obj Value to check.
 * @returns {boolean} `true` if iterable, `false` if not.
 */
function iterable(obj) {
	if(obj == null) return false;
	return typeof obj[Symbol.iterator] === 'function';
}


/* === Building Response Objects From Parsed XML === */

/**
 * Confirms that the given root exists and executes the handler function on it.
 * @param {object} root Part of the object returned by the XML parser to use as root element.
 * @param {function} handler Handler function to use on the root.
 * @returns The return value of the handler function.
 */
function handle(root, handler) {
	if(root === undefined || typeof handler !== 'function') return undefined;
	else return handler(root);
}

/**
 * Confirms that the given root exists and executes the handler function on it.
 * @param {any[]} root Array property of the object returned by the XML parser to use as root.
 * @param {function} handler Handler function to use on the elements of the root.
 * @returns A list with the results from the handler function for each element of the root.
 */
function handleList(root, handler) {
	if(root === undefined || typeof handler !== 'function') return [];
	let ret = [];
	let iterate = secureArray(root);
	if(iterable(iterate)) for(let obj of iterate) ret.push(handler(obj));
	return ret;
}

/**
 * Wraps the given value into a single-element array, if it isn't already an array.
 * @param {*} arr Value to confirm as array.
 * @returns {any[]} The value, if it's an array, otherwise a single-element array with the value.
 */
function secureArray(arr) {
	if(!Array.isArray(arr)) arr = [arr];
	return arr;
}


/* === === */

/**
 * @typedef {object} Auction
 * Represents an ongoing auction on a card.
 * @prop {number} id ID of the card being auctioned.
 * @prop {string} rarity {@linkcode Rarity} of the card being auctioned.
 * @prop {string} nation Name of the nation depicted on the card that is being auctioned.
 * @prop {number} season ID of the season the card that is being auctioned was inscribed for.
 */
/**
 * Builds an auction object from the provided parsed response XML.
 * @param {object} auction The root object - an `<AUCTION>` tag in the parsed XML object.
 * @returns {Auction} The built auction object.
 */
function parseAuction(auction) {
	return {
		id:		num(auction, 'CARDID'),
		rarity:	txt(auction, 'CATEGORY'),
		nation:	txt(auction, 'NAME'),
		season:	num(auction, 'SEASON')
	}
}

/**
 * @typedef {object} WABadge
 * Represents a commendation, condemnation, liberation, or injunction badge displayed
 * on a nation or region as a result of an active Security Council resolution.
 * @prop {number} resolution ID of the SC resolution imposing the badge.
 * @prop {string} type {@linkcode WABadgeType} of the badge.
 */
/**
 * Builds a badge object from the provided parsed response XML.
 * @param {object} badge The root object - a `<WABADGE>` tag in the parsed XML object.
 * @returns {WABadge} The built badge object.
 */
function parseBadge(badge) {
	return {
		resolution: parseInt(badge['$text']),
		type: attr(badge, 'TYPE')
	};
}

/**
 * @typedef {object} Banner
 * Represents a national banner.
 * @prop {string} id ID of the banner.
 * @prop {string} name Full name of the banner.
 * @prop {string} condition (Vague) description of the banner's unlock condition.
 */
/**
 * Builds a banner object from the provided parsed response XML.
 * @param {object} banner The root object - a `<BANNER>` tag in the parsed XML object.
 * @returns {Banner} The built banner object.
 */
function parseBanner(banner) {
	return {
		id: attr(banner, 'ID'),
		name: txt(banner, 'NAME'),
		condition: txt(banner, 'VALIDITY')
	};
}

/**
 * @typedef {object} ListCard
 * Represents the most basic data about a card, as listed in a {@linkcode Collection}.
 * @prop {number} id ID of the card; equal to the database ID of the nation that is depicted on it.
 * @prop {string} rarity {@linkcode Rarity} of the card.
 * @prop {number} season ID of the season that the card was inscribed for.
 */
/**
 * Builds a card-overview object from the provided parsed response XML.
 * @param {object} c The root object - a `<CARD>` tag in the parsed XML object.
 * @returns {ListCard} The built card-overview object.
 */
function parseCardOverview(c) {
	return {
		id:		num(c, 'CARDID'),
		rarity:	txt(c, 'CATEGORY'),
		season:	num(c, 'SEASON')
	}
}

/**
 * @typedef {object} CensusDataNation
 * Container object holding data on a nation's performance on a World Census scale.
 * @prop {number} id ID of the {@linkcode CensusScale} the rank is for.
 * @prop {number} score Raw score of the nation on the scale.
 * @prop {number} rankRegion Rank of the nation on the scale within their region.
 * @prop {number} rankRegionPercent Percentile of the nation on the scale within their region.
 * @prop {number} rankWorld Rank of the nation on the scale world-wide.
 * @prop {number} rankWorldPercent Percentile of the nation on the scale world-wide. 
 */
/**
 * Builds a rank object from the provided parsed response XML.
 * @param {object} scale The root object - a `<SCALE>` tag in the parsed XML object.
 * @returns {CensusDataNation} The built rank object.
 */
function parseCensusNation(scale) {
	return {
		id: parseInt(attr(scale, 'ID')),
		score: num(scale, 'SCORE'),
		rankRegion: num(scale, 'RRANK'),
		rankRegionPercent: num(scale, 'PRRANK'),
		rankWorld: num(scale, 'RANK'),
		rankWorldPercent: num(scale, 'PRANK')
	};
}

/**
 * @typedef {object} CensusRankScored
 * Container object for a nation's rank on a given World Census scale, including the raw score.
 * @prop {string} nation Name of the nation.
 * @prop {number} rank Rank of the nation on the scale.
 * @prop {number} score Score of the nation on the scale.
 */
/**
 * Builds a scored rank object from the provided parsed response XML.
 * @param {object} nation The root object - a `<NATION>` tag in the parsed XML object.
 * @returns {CensusRankScored} The built scored rank object.
 */
function parseCensusRank(nation) {
	return {
		nation: txt(nation, 'NAME'),
		rank: num(nation, 'RANK'),
		score: num(nation, 'SCORE')
	};
}

/**
 * @typedef {object} CensusRankUnscored
 * Container object holding data on a nation's rank on the day's featured World Census scale.
 * @prop {number} scale ID of the {@linkcode CensusScale} the rank is for.
 * @prop {number} rank The rank of the nation.
 */
/**
 * Builds a rank object from the provided parsed response XML.
 * @param {object} scale The root object - a `<WCENSUS>` or `<RCENSUS>` tag in the parsed XML object.
 * @returns {CensusRankUnscored} The built rank object.
 */
function parseCensusRankUnscored(scale) {
	return {
		scale: parseInt(attr(scale, 'ID')),
		rank: parseInt(scale['$text'])
	};
}

/**
 * @typedef {object} CensusDataRegion
 * Container object holding data on a region's performance on a World Census scale,
 * depending on its residents' scores on it.
 * @prop {number} id ID of the {@linkcode CensusScale} the rank is for.
 * @prop {number} average Average score of the region's residents on the scale.
 * @prop {number} rank Rank of the region on the scale.
 * @prop {number} rankPercent Percentile of the region on the scale. 
 */
/**
 * Builds a rank object from the provided parsed response XML.
 * @param {object} scale The root object - a `<SCALE>` tag in the parsed XML object.
 * @returns {CensusDataRegion} The built rank object.
 */
function parseCensusRegion(scale) {
	return {
		id: parseInt(attr(scale, 'ID')),
		average: num(scale, 'SCORE'),
		rank: num(scale, 'RANK'),
		rankPercent: num(scale, 'PRANK')
	};
}

/**
 * @typedef {object} WCensusAverage
 * Container object for the average national score on a given World Census scale.
 * @prop {number} id ID of the scale the average is for.
 * @prop {number} average World-wide average score of nations on the scale.
 * @see {@linkcode CensusScale} for possible scale IDs.
 */
/**
 * Builds a census-average object from the provided parsed response XML.
 * @param {object} scale The root object - a `<SCALE>` tag in the parsed XML object.
 * @returns {WCensusAverage} The built census-average object.
 */
function parseCensusWorld(scale) {
	return {
		id: attr(scale, 'ID'),
		average: num(scale, 'SCORE'),
	};
}

/**
 * @typedef {object} Collection
 * Represents a collection of cards in detailed form.
 * @prop {string} name Name of the collection.
 * @prop {string} owner Name of the nation that created the collection.
 * @prop {number} edited Unix epoch timestamp of when the last change was made to the collection.
 * @prop {ListCard[]} cards List of all cards in the collection.
 */
/**
 * Builds a collection object from the provided parsed response XML.
 * @param {object} c The root object - the `<COLLECTION>` tag in the parsed XML object.
 * @returns {Collection} The built collection object.
 */
function parseCollection(c) {
	return {
		name:	txt(c, 'NAME'),
		owner:	txt(c, 'NATION'),
		edited:	num(c, 'UPDATED'),
		cards:	handleList(c['DECK'], parseCardOverview)
	}
}

/**
 * @typedef {object} ListCollection
 * Represents a collection of cards in its most basic form, such as when displayed in a list.
 * @prop {number} id ID of the collection.
 * @prop {string} name Name of the collection.
 * @prop {number} edited Unix epoch timestamp of when the last change was made to the collection.
 */
/**
 * Builds a collection-overview object from the provided parsed response XML.
 * @param {object} c The root object - a `<COLLECTION>` tag in the parsed XML object.
 * @returns {WCensusAverage} The built collection-overview object.
 */
function parseCollectionOverview(c) {
	return {
		id:		num(c, 'COLLECTIONID'),
		name:	txt(c, 'NAME'),
		edited:	num(c, 'LAST_UPDATED')
	}
}

/**
 * @typedef {object} DeathData
 * Represents a cause of death with its prevalence in a nation.
 * @prop {string} cause {@linkcode DeathCause} the data describes.
 * @prop {number} percent Percentage of yearly deaths in the nation ascribed to the cause.
 */
/**
 * Builds a death data object from the provided parsed response XML.
 * @param {object} nation The root object - a `<CAUSE>` tag in the parsed XML object.
 * @returns {DeathData} The built death data object.
 */
function parseDeath(cause) {
	return {
		cause: attr(cause, 'TYPE'),
		percent: parseFloat(cause['$text'])
	}
}

/**
 * @typedef {object} Deck
 * Represents a nation's deck of trading cards.
 * @prop {number} nationID Database ID of the nation that owns the deck.
 * @prop {string} nationName Name of the nation that owns the deck.
 * @prop {number} bank Amount of bank the deck owner currently has.
 * @prop {number} capacity Maximum number of cards that may be in the deck concurrently.
 * @prop {number} numCards Total number of cards currently in the deck.
 * @prop {number} value Aggregate market value of all cards currently in the deck.
 * @prop {number} valueTime Unix epoch timestamp of when the deck's value was last assessed.
 * @prop {number} rank World-wide rank of the deck according to its value.
 * @prop {number} rankRegion Region-wide rank of the deck according to its value.
 * @prop {number} lastPack Unix epoch timestamp of when the deck owner last opened a card pack.
 */
/**
 * Builds a deck object from the provided parsed response XML.
 * @param {object} deck The root object - the `<INFO>` tag in the parsed XML object.
 * @returns {Deck} The built deck object.
 */
function parseDeckSummary(deck) {
	return {
		nationID:	num(deck, 'ID'),
		nationName:	txt(deck, 'NAME'),
		bank:		num(deck, 'BANK'),
		capacity:	num(deck, 'DECK_CAPACITY_RAW'),
		numCards:	num(deck, 'NUM_CARDS'),
		value:		num(deck, 'DECK_VALUE'),
		valueTime:	num(deck, 'LAST_VALUED'),
		rank:		num(deck, 'RANK'),
		rankRegion:	num(deck, 'REGION_RANK'),
		lastPack:	num(deck, 'LAST_PACK_OPENED')
	}
}

/**
 * @typedef {object} DelegateActiveVote
 * Represents an extant vote cast by a WA delegate on an at-vote {@linkcode Resolution}.
 * @prop {string} delegate Name of the delegate.
 * @prop {number} weight Number of votes the delegate currently has.
 * @prop {number} timestamp Unix epoch timestamp of when the vote was cast.
 */
/**
 * Builds a delegate-vote object from the provided parsed response XML.
 * @param {object} root The root object - a `<DELEGATE>` tag in the parsed XML object.
 * @returns {DelegateActiveVote} The built delegate-vote object.
 */
function parseDelegateActiveVote(v) {
	return {
		delegate:	txt(v, 'NATION'),
		weight:		num(v, 'VOTES'),
		timestamp:	num(v, 'TIMESTAMP')
	};
}

/**
 * @typedef {object} DelegateLogVote
 * Represents a vote cast by a WA delegate on an at-vote {@linkcode Resolution}.
 * This may be a since-overridden or a still active vote.
 * @prop {string} delegate Name of the delegate.
 * @prop {'FOR' | 'AGAINST'} vote Which way the delegate voted.
 * @prop {number} weight Number of votes the delegate currently has.
 * @prop {number} timestamp Unix epoch timestamp of when the vote was cast.
 */
/**
 * Builds a delegate-vote object from the provided parsed response XML.
 * @param {object} log The root object - an `<ENTRY>` tag in the parsed XML object.
 * @returns {DelegateLogVote} The built delegate-vote object.
 */
function parseDelegateLogVote(log) {
	return {
		delegate: txt(log, 'NATION'),
		vote: txt(log, 'ACTION'),
		weight: num(log, 'VOTES'),
		timestamp: num(log, 'TIMESTAMP')
	};
}

/**
 * @typedef {object} DelegateVoteSummary
 * Container object holding data on the currently active votes
 * of WA delegates on an at-vote {@linkcode Resolution}.
 * @prop {DelegateActiveVote[]} for Details of the delegates voting For the resolution.
 * @prop {DelegateActiveVote[]} against Details of the delegates voting Against the resolution.
 */
/**
 * Builds a delegate-vote summary object from the provided parsed response XML.
 * @param {object} root The root object - the `<RESOLUTION>` tag in the parsed XML object.
 * @returns {DelegateVoteSummary} The built delegate-vote summary object.
 */
function parseDelegateVotes(root) {
	return {
		for: handleList(root['DELVOTES_FOR'], parseDelegateActiveVote),
		against: handleList(root['DELVOTES_AGAINST'], parseDelegateActiveVote)
	};
}

/**
 * @typedef {object} Dispatch
 * Represents a dispatch.
 * @prop {number} id ID of the dispatch.
 * @prop {string} title The dispatch's title.
 * @prop {string} author Name of the nation that published the dispatch.
 * @prop {string} category {@linkcode DispatchSubcategory} the dispatch is published under.
 * @prop {string} body Body text of the dispatch.
 * @prop {number} posted Unix epoch timestamp of when the dispatch was originally published.
 * @prop {number} edited Unix epoch timestamp of when the dispatch was last edited.
 * @prop {number} views Number of times the dispatch was viewed by nations other than its author.
 * @prop {number} score The dispatch's score - itd number of upvotes minus its number of downvotes.
 */
/**
 * Builds a dispatch object from the provided parsed response XML.
 * @param {object} scale The root object - a `<DISPATCH>` tag in the parsed XML object.
 * @returns {Dispatch} The built dispatch object.
 */
function parseDispatch(obj) {
	return {
		id: parseInt(attr(obj, 'ID')),
		title: txt(obj, 'TITLE'),
		author: txt(obj, 'AUTHOR'),
		category: `${txt(obj, 'CATEGORY')}:${txt(obj, 'SUBCATEGORY')}`,
		body: txt(obj, 'TEXT'),
		posted: num(obj, 'CREATED'),
		edited: num(obj, 'EDITED'),
		views: num(obj, 'VIEWS'),
		score: num(obj, 'SCORE')
	};
}

/**
 * @typedef {object} ListDispatch
 * Represents a dispatch without its body text.
 * @prop {number} id ID of the dispatch.
 * @prop {string} title The dispatch's title.
 * @prop {string} author Name of the nation that published the dispatch.
 * @prop {string} category The {@linkcode DispatchSubcategory} the dispatch is published under.
 * @prop {number} posted Unix epoch timestamp of when the dispatch was originally published.
 * @prop {number} edited Unix epoch timestamp of when the dispatch was last edited.
 * @prop {number} views Number of times the dispatch was viewed by nations other than its author.
 * @prop {number} score The dispatch's score - itd number of upvotes minus its number of downvotes.
 */
/**
 * Builds a dispatch object from the provided parsed response XML.
 * @param {object} obj The root object - a `<DISPATCH>` tag in the parsed XML object.
 * @returns {ListDispatch} The built dispatch object.
 */
function parseDispatchOverview(obj) {
	return {
		id: parseInt(attr(obj, 'ID')),
		title:		txt(obj, 'TITLE'),
		author:		txt(obj, 'AUTHOR'),
		category:	`${txt(obj, 'CATEGORY')}:${txt(obj, 'SUBCATEGORY')}`,
		posted:		num(obj, 'CREATED'),
		edited:		num(obj, 'EDITED'),
		views:		num(obj, 'VIEWS'),
		score:		num(obj, 'SCORE')
	};
}

/**
 * @typedef {object} EmbassyData
 * Container object holding data on a region's embassies and embassy requests.
 * @prop {string[]} standing Names of the regions that share an active embassy with the region.
 * @prop {string[]} invited Names of the regions that have a pending embassy request to the region.
 * @prop {string[]} requested Names of the regions the region sent a pending embassy request to.
 * @prop {string[]} rejected Names of the regions whose embassy requests the region rejected.
 * @prop {string[]} denied Names of the regions who denied the region's embassy request.
 * @prop {string[]} opening Names of the regions with which embassies are currently opening.
 * @prop {string[]} closing Names of the regions with which embassies are currently closing.
 */
/**
 * Builds the embassies object from the provided parsed response XML.
 * @param {object} p The root object - the embassies tag in the parsed XML object.
 * @returns {EmbassyData} The built embassies object.
 */
function parseEmbassies(embassies) {
	let ret = {
		standing: [],
		invited: [],
		requested: [],
		rejected: [],
		denied: [],
		opening: [],
		closing: []
	}
	if(iterable(embassies)) for(let embassy of embassies) {
		if(typeof embassy === 'string') ret.standing.push(embassy);
		else switch(attr(embassy, 'TYPE')) {
			case 'denied':		ret.denied.push(embassy['$text']); break;
			case 'invited':		ret.invited.push(embassy['$text']); break;
			case 'closing':		ret.closing.push(embassy['$text']); break;
			case 'pending':		ret.opening.push(embassy['$text']); break;
			case 'requested':	ret.requested.push(embassy['$text']); break;
			case 'rejected':	ret.rejected.push(embassy['$text']); break;
		}
	}
	return ret;
}

/**
 * @typedef {object} ListFaction
 * Represents a summary of basic information on an N-Day faction. 
 * @prop {number} id ID of the faction.
 * @prop {string} name Name of the faction.
 * @prop {number} score Current score of the faction.
 * @prop {string} region Name of the region that founded the faction.
 * @prop {number} numMembers Total number of nations that are members of the faction.
 */
/**
 * Builds a faction object from the provided parsed response XML.
 * @param {object} faction The root object - a `<FACTION>` tag in the parsed XML object.
 * @returns {ListFaction} The built faction object.
 */
function parseFaction(faction) {
	return {
		id: parseInt(attr(faction, 'ID')),
		name: txt(faction, 'NAME'),
		score: num(faction, 'SCORE'),
		region: txt(faction, 'REGION'),
		numMembers: num(faction, 'NATIONS')
	};
}

/**
 * @typedef {object} Faction
 * Represents an N-Day faction.
 * @prop {number} id ID of the faction.
 * @prop {string} name Name of the faction.
 * @prop {string} description Description of the faction, similar to a regional WFE.
 * @prop {number} created Unix epoch timestamp of when the faction was founded.
 * @prop {string} region Name of the region that founded the faction.
 * @prop {number} entry TODO: Entry status code meanings
 * @prop {number} score Current score of the faction: `strikes` minus `radiation`.
 * @prop {number} strikes Total number of nukes fired by faction members that hit their target.
 * @prop {number} radiation Total number of nukes that have hit members of the faction.
 * @prop {number} production Total number of production units between faction members.
 * @prop {number} nukes Total number of nukes stockpiled by faction members.
 * @prop {number} shields Total number of shields stockpiled by faction members.
 * @prop {number} targets Total number of nukes faction members are currently readying.
 * @prop {number} launches Total number of faction member nukes currently in the air.
 * @prop {number} targeted Total number of nukes currently readied against faction members.
 * @prop {number} incoming Total number of nukes currently flying towards faction members.
 */
/**
 * Builds a faction details object from the provided parsed response XML.
 * @param {object} faction The root object - the `<FACTION>` tag in the parsed XML object.
 * @returns {Faction} The built faction details object.
 */
function parseFactionDetails(faction) {
	return {
		id:			num(faction, 'ID'),
		name:		txt(faction, 'NAME'),
		description:txt(faction, 'DESC'),
		created:	num(faction, 'FOUNDED'),
		region:		txt(faction, 'RNAME'),
		entry:		num(faction, 'ENTRY'),
		score:		num(faction, 'SCORE'),
		strikes:	num(faction, 'STRIKES'),
		radiation:	num(faction, 'RADIATION'),
		production:	num(faction, 'PRODUCTION'),
		nukes:		num(faction, 'NUKES'),
		shields:	num(faction, 'SHIELD'),
		targets:	num(faction, 'TARGETS'),
		launches:	num(faction, 'LAUNCHES'),
		targeted:	num(faction, 'TARGETED'),
		incoming:	num(faction, 'INCOMING')
	};
}

/**
 * @typedef {object} FreedomsData
 * Container object holding data on a nation's civil, economic, and political freedoms.
 * @prop {string} civil Description of the nation's civil rights situation.
 * @prop {string} economic Description of the extent of economic freedom the nation grants.
 * @prop {string} political Description of the level of the nation's political freedom.
 */
/**
 * Builds a freedoms data object from the provided parsed response XML.
 * @param {object} root The root object - the `<FREEDOM>` tag in the parsed XML object.
 * @returns {FreedomsData} The built freedoms data object.
 */
function parseFreedoms(root) {
	return {
		civil: txt(root, 'CIVILRIGHTS'),
		economic: txt(root, 'ECONOMY'),
		political: txt(root, 'POLITICALFREEDOM')
	};
}

/**
 * @typedef {object} Happening
 * Represents a happening event in the NationStates world.
 * @prop {number} timestamp Unix epoch timestamp of when the happening occurred.
 * @prop {string} text Text description of what transpired in the happening.
 */
/**
 * Builds a happening object from the provided parsed response XML.
 * @param {object} event The root object - a `<HAPPENING>` tag in the parsed XML object.
 * @returns {Happening} The built happening object.
 */
function parseHappening(event) {
	return {
		timestamp: num(event, 'TIMESTAMP'),
		text: txt(event, 'TEXT')
	};
}

/**
 * @typedef {object} HDIData
 * Container object holding data on the different component scores that
 * ultimately combine into a nation's final World Census HDI score.
 * @prop {number} score The final HDI score.
 * @prop {number} economy The economic score component.
 * @prop {number} education The educational score component.
 * @prop {number} lifespan The life expectancy score component.
 */
/**
 * Builds an HDI data object from the provided parsed response XML.
 * @param {object} root The - due to the response XML structure - actual root object.
 * @returns {HDIData} The built HDI data object.
 */
function parseHDI(root) {
	return {
		score: num(root, 'HDI'),
		economy: num(root, 'HDI-ECONOMY'),
		education: num(root, 'HDI-SMART'),
		lifespan: num(root, 'HDI-LIFESPAN')
	}
}

/**
 * @typedef {object} HistoryEvent
 * Represents an important happening in a region's history.
 * @prop {number} timestamp Unix epoch timestamp of when the happening occurred.
 * @prop {string} description Short description of what happened.
 */
/**
 * Builds a history event object from the provided parsed response XML.
 * @param {object} o The root object - the `<EVENT>` tag in the parsed XML object.
 * @returns {HistoryEvent} The built history event object.
 */
function parseHistoryEvent(event) {
	return {
		timestamp: num(event, 'TIMESTAMP'),
		description: txt(event, 'TEXT')
	};
}

/**
 * @typedef {object} IDHappening
 * Represents a happening event in the NationStates world.
 * @prop {number} id ID of the happening.
 * @prop {number} timestamp Unix epoch timestamp of when the happening occurred.
 * @prop {string} text Text description of what transpired in the happening.
 */
/**
 * Builds a happening object from the provided parsed response XML.
 * @param {object} event The root object - a `<HAPPENING>` tag in the parsed XML object.
 * @returns {IDHappening} The built happening object.
 */
function parseIDHappening(event) {
	return {
		id: parseInt(attr(event, 'ID')),
		timestamp: num(event, 'TIMESTAMP'),
		text: txt(event, 'TEXT')
	};
}

/**
 * @typedef {object} Issue
 * Represents an issue confronting a nation.
 * @prop {number} id ID of the issue.
 * @prop {string} title Title of the issue, shown as a newspaper headline.
 * @prop {string} description Body text describing the premise of the issue.
 * @prop {IssueOption[]} options {@linkcode IssueOption}s available to the nation as answers.
 * @prop {string} author Name of the nation that authored the issue.
 * @prop {string} editor Name of the nation that edited the issue for publication.
 * @prop {string[]} images List of banner image codes for the issue, shown as newspaper pictures.
 */
/**
 * Builds an issue object from the provided parsed response XML.
 * @param {object} issue The root object - an `<ISSUE>` tag in the parsed XML object.
 * @returns {Issue} The built issue object.
 */
function parseIssue(issue) {
	return {
		id:			parseInt(attr(issue, 'ID')),
		title:		txt(issue, 'TITLE'),
		description:txt(issue, 'TEXT'),
		options:	handleList(issue['OPTION'], parseIssueOption),
		author:		txt(issue, 'AUTHOR'),
		editor:		txt(issue, 'EDITOR'),
		images: [
			txt(issue, 'PIC1'),
			txt(issue, 'PIC2')
		]
	};
}

/**
 * @typedef {object} IssueOption
 * Represents an option that may be chosen to answer an {@linkcode Issue}.
 * @prop {number} id Issue-internal ID of the option.
 * @prop {string} text Body text describing the option.
 */
/**
 * Builds an issue option object from the provided parsed response XML.
 * @param {object} option The root object - an `<OPTION>` tag in the parsed XML object.
 * @returns {IssueOption} The built issue option object.
 */
function parseIssueOption(option) {
	return {
		id: attr(option, 'ID'),
		text: option['$text']
	};
}

/**
 * @typedef {object} LegalityData
 * Container object holding data on a {@linkcode Proposal}'s current legal status - that
 * is, the decisions of Moderators or General Secretariat members on its rule compliance.
 * @prop {string[]} legal List with the names of the nations ruling the proposal legal.
 * @prop {string[]} illegal List with the names of the nations ruling the proposal illegal.
 * @prop {string[]} discard List with the names of the nations voting to discard the proposal.
 * @prop {LegalityDecision[]} log Complete list of rulings made on the proposal.
 */
/**
 * Builds a legality object from the provided parsed response XML.
 * @param {object} root The root object - the `<GENSEC>` tag in the parsed XML object.
 * @returns {LegalityData} The built legality object.
 */
function parseLegality(root) {
	return {
		discard:	arr(root, 'DISCARD') || [],
		illegal:	arr(root, 'ILLEGAL') || [],
		legal:		arr(root, 'LEGAL') || [],
		log: handleList(root['LOG'], parseLegalityDecision)
	}
}

/**
 * @typedef {object} LegalityDecision
 * Represents a ruling of a Moderator or a member of the General Secretariat
 * concerning the legality of a concrete {@linkcode Proposal}.
 * @prop {string} nation Name of the nation that made the ruling.
 * @prop {'Legal' | 'Illegal' | 'Discard'} decision The ruling made.
 * @prop {string} reason Comment attached to the ruling by the nation that made it.
 * @prop {number} timestamp Unix epoch timestamp of when the ruling was made.
 */
/**
 * Builds a legality-decision object from the provided parsed response XML.
 * @param {object} decision The root object - an `<ENTRY>` tag in the parsed XML object.
 * @returns {Proposal} The built legality-decision object.
 */
function parseLegalityDecision(decision) {
	return {
		nation:		txt(decision, 'NATION'),
		decision:	txt(decision, 'DECISION'),
		reason:		txt(decision, 'REASON') || '',
		timestamp:	num(decision, 'T')
	}
}

/**
 * @typedef {object} Market
 * Represents an ask or bid on a card in the auction house.
 * @prop {string} nation Name of the nation entertaining this market.
 * @prop {number} bank Amount of bank placed in this market.
 * @prop {'ask' | 'bid'} type Whether this market is an ask or a bid on a card.
 * @prop {number} timestamp Unix epoch timestamp of when this market was created.
 */
/**
 * Builds a market object from the provided parsed response XML.
 * @param {object} market The root object - a `<MARKET>` tag in the parsed XML object.
 * @returns {Market} The built market object.
 */
function parseMarket(market) {
	return {
		nation:		txt(market, 'NATION'),
		bank:		num(market, 'PRICE'),
		type:		txt(market, 'TYPE'),
		timestamp:	num(market, 'TIMESTAMP')
	}
}

/**
 * @typedef {object} NewNation
 * Represents the founding details of a newly founded nation.
 * @prop {string} nation Name of the nation.
 * @prop {string} region Name of the region the nation was founded in.
 * @prop {number} founded Unix epoch timestamp of when the nation was founded.
 */
/**
 * Builds a new-nation details object from the provided parsed response XML.
 * @param {object} nation The root object - a `<NEWNATIONDETAILS>` tag in the parsed XML object.
 * @returns {NewNation} The built new-nation details object.
 */
function parseNewNationsDetails(nation) {
	return {
		nation: attr(nation, 'NAME'),
		region: txt(nation, 'REGION'),
		founded: num(nation, 'FOUNDEDTIME')
	};
}

/**
 * @typedef {object} Notice
 * Represents a notice alert generated for a nation.
 * @prop {string} title Title of the notice.
 * @prop {string} text Body text of the notice.
 * @prop {number} time Unix epoch timestamp of when the notice was generated.
 * @prop {string} type {@linkcode NoticeType} of the notice.
 * @prop {string} icon Type of the icon shown for the notice.
 * @prop {string} url URL to open when the notice is clicked.
 * @prop {string} who Name of the nation that caused the notice to be generated.
 * @prop {boolean} isNew Whether or not the notice was viewed by the nation before.
 * @prop {boolean} ok I have no idea.
 */
/**
 * Builds a notice object from the provided parsed response XML.
 * @param {object} notice The root object - a `<NOTICE>` tag in the parsed XML object.
 * @returns {Notice} The built notice object.
 */
function parseNotice(notice) {
	return {
		title:	txt(notice, 'TITLE'),
		text:	txt(notice, 'TEXT'),
		time:	num(notice, 'TIMESTAMP'),
		type:	txt(notice, 'TYPE'),
		icon:	txt(notice, 'TYPE_ICON'),
		url:	txt(notice, 'URL'),
		who:	txt(notice, 'WHO'),
		isNew:	num(notice, 'NEW') == 1,
		ok:		num(notice, 'OK') == 1
	};
}

/**
 * @typedef {object} Officer
 * Represents a regional officer of a region.
 * @prop {string} nation Name of the officer nation.
 * @prop {string} office Name of the office held by the officer.
 * @prop {string} appointer Name of the nation that appointed the officer.
 * @prop {string[]} authorities List of the officer's {@linkcode OfficerAuthority} codes.
 * @prop {number} appointment Unix epoch timestamp for when the officer was appointed.
 * @prop {number} order 1-indexed position on which the officer is displayed.
 */
/**
 * Builds an officer object from the provided parsed response XML.
 * @param {object} o The root object - the `<OFFICER>` tag in the parsed XML object.
 * @returns {Officer} The built officer object.
 */
function parseOfficer(o) {
	return {
		nation:			txt(o, 'NATION'),
		office:			txt(o, 'OFFICE'),
		appointer:		txt(o, 'BY'),
		authorities:	[...(txt(o, 'AUTHORITY') || [])],
		appointment:	num(o, 'TIME'),
		order:			num(o, 'ORDER')
	};
}

/**
 * @typedef {object} Policy
 * Represents a national policy.
 * @prop {string} category General field the policy concerns.
 * @prop {string} name Name of the policy.
 * @prop {string} description Short description of the policy content.
 * @prop {string} image ID of the policy banner image.
 */
/**
 * Builds a policy object from the provided parsed response XML.
 * @param {object} policy The root object - a `<POLICY>` tag in the parsed XML object.
 * @returns {Policy} The built policy object.
 */
function parsePolicy(policy) {
	return {
		category: txt(policy, 'CAT'),
		name: txt(policy, 'NAME'),
		description: txt(policy, 'DESC'),
		image: txt(policy, 'PIC')
	};
}

/**
 * @typedef {object} Poll
 * @prop {string} title The title of the poll.
 * @prop {string | undefined} description The (optional) description of the poll.
 * @prop {string} author Name of the nation that created the poll.
 * @prop {string} region Name of the region that the poll is running in.
 * @prop {number} opens Unix epoch timestamp for when the poll opens.
 * @prop {number} closes Unix epoch timestamp for when the poll closes.
 * @prop {PollOption[]} options List of the available {@linkcode PollOption}s to vote for.
 */
/**
 * @typedef {object} PollOption
 * Represents a voting option on a {@linkcode Poll}.
 * @prop {string} text Text of the option.
 * @prop {number} votes Total number of votes for the option.
 * @prop {string[]} voters List with the names of all nations that voted for the option.
 */
/**
 * Builds a poll object from the provided parsed response XML.
 * @param {object} root The root object - the `<POLL>` tag in the parsed XML object.
 * @returns {Poll} The built poll object.
 */
function parsePoll(root) {
	let options = [];
	for(let option of root['OPTIONS']) options[parseInt(attr(option, 'ID'))] = {
		text: txt(option, 'OPTIONTEXT'),
		votes: num(option, 'VOTES'),
		voters: txt(option, 'VOTERS')?.split(':')
	}
	return {
		title: txt(root, 'TITLE'),
		description: txt(root, 'TEXT'),
		author: txt(root, 'AUTHOR'),
		region: txt(root, 'REGION'),
		opens: num(root, 'START'),
		closes: num(root, 'STOP'),
		options: options
	}
}

/**
 * @typedef {object} Proposal
 * Represents a proposal for a new resolution currently before the delegates of the World Assembly.
 * @prop {string} id ID of the proposal.
 * @prop {string} title Title of the proposal.
 * @prop {string} author Name of the nation that submitted the proposal.
 * @prop {string} text Body text of the proposal.
 * @prop {string[]} approvals List with the names of all WA delegates approving the proposal.
 * @prop {number} submitted Unix epoch timestamp of when the proposal was submitted.
 * @prop {string} category {@linkcode WACategory} the proposal was submitted under.
 * @prop {string} option Depending on the category, either the resolution's subcategory or target.
 * @prop {LegalityData} legality Details of rulings on the proposal's compliance with WA rules.
 */
/**
 * Builds a proposal object from the provided parsed response XML.
 * @param {object} p The root object - a `<PROPOSAL>` tag in the parsed XML object.
 * @returns {Proposal} The built proposal object.
 */
function parseProposal(p) {
	return {
		id: attr(p, 'ID'),
		title: txt(p, 'NAME'),
		author: txt(p, 'PROPOSED_BY'),
		text: txt(p, 'DESC'),
		approvals: txt(p, 'APPROVALS')?.split(':') || [],
		submitted: num(p, 'CREATED'),
		category: txt(p, 'CATEGORY'),
		option: txt(p, 'OPTION'),
		// The <GENSEC> tag isn't returned by the API if there was no legality ruling yet
		legality: handle(p['GENSEC'] || {LOG: []}, parseLegality)
	};
}

/**
 * @typedef {object} RankChange
 * Represents a change in a nation's performance on a World Census scale.
 * @prop {number} scale {@linkcode CensusScale} ID of the affected scale.
 * @prop {number} changeAbsolute Absolute score change on the scale in its units.
 * @prop {number} changeRelative Relative score change on the scale in percent.
 * @prop {number} newScore New absolute score of the nation on the scale.
 */
/**
 * Builds a rank-change object from the provided parsed response XML.
 * @param {object} change The root object - a `<RANK>` tag in the parsed XML object.
 * @returns {RankChange} The built rank-change object.
 */
function parseRankChange(change) {
	return {
		scale: parseInt(attr(change, 'ID')),
		changeAbsolute:	num(change, 'CHANGE'),
		changePercent:	num(change, 'PCHANGE'),
		newScore:		num(change, 'SCORE')
	};
}

/**
 * @typedef {object} Reclassification
 * Represents a reclassification of a nation's level of civil,
 * economic, or political freedom through an {@linkcode AnsweredIssue}.
 * @prop {number} category {@linkcode ReclassificationCategory} the reclassification concerns.
 * @prop {string} from Level the freedom was on prior to answering the issue.
 * @prop {string} to Level the freedom is on after answering the issue.
 */
/**
 * Builds a reclassification object from the provided parsed response XML.
 * @param {object} root The root object - a `<RECLASSIFY>` tag in the parsed XML object.
 * @returns {Reclassification} The built reclassification object.
 */
function parseReclassification(root) {
	return {
		category:	attr(root, 'TYPE'),
		from:		txt(root, 'FROM'),
		to:			txt(root, 'TO')
	}
}

/**
 * @typedef {object} Resolution
 * Represents a resolution at-vote in or passed by a council of the World Assembly.
 * @prop {string} id ID of the resolution.
 * @prop {string} title Title of the resolution.
 * @prop {string} author Name of the nation that submitted the resolution.
 * @prop {string[]} coauthors List with the names of all nations declared as co-authors.
 * @prop {string} text Body text of the resolution.
 * @prop {string[]} approvals List with the names of all WA delegates approving the resolution.
 * @prop {number} submitted Unix epoch timestamp of when the resolution was submitted.
 * @prop {number} promoted Unix epoch timestamp of when voting started on the resolution.
 * @prop {number | null} implemented Unix epoch timestamp for when the resolution got passed.
 * @prop {number | null} repealed ID of the resolution that repealed this resolution.
 * @prop {string} category {@linkcode WACategory} the resolution was submitted under.
 * @prop {string} option Depending on the category, the resolution's subcategory or its target.
 * @prop {VoteSummary} vote Summary of the votes on the resolution as of now.
 */
/**
 * Builds a resolution object from the provided parsed response XML.
 * @param {object} r The root object - the `<RESOLUTION>` tag in the parsed XML object.
 * @returns {Resolution} The built resolution object.
 */
function parseResolution(r) {

	// If there is no resolution at vote currently or a nonexistent passed one was
	// queried, don't continue further
	if(!r) return undefined;

	// Finally, combine everything into the resolution object to return
	return {
		id: txt(r, 'ID') || txt(r, 'COUNCILID'),
		title: txt(r, 'NAME'),
		author: txt(r, 'PROPOSED_BY'),
		coauthors: arr(r, 'COAUTHOR') || [],
		text: txt(r, 'DESC'),
		submitted: num(r, 'CREATED'),
		promoted: num(r, 'PROMOTED'),
		implemented: num(r, 'IMPLEMENTED') || null,
		repealed: num(r, 'REPEALED_BY') || null,
		category: txt(r, 'CATEGORY'),
		option: txt(r, 'OPTION'),
		vote: parseVoteData(r)
	}
}

/**
 * @typedef {object} RMBActivityAggregate
 * Container object holding data on a nation's aggregate RMB activity.
 * @prop {string} nation Name of the nation the data is for.
 * @prop {number} score Total number of hits for the nation for the leaderboard type.
 */
/**
 * Builds an array of nations' aggregate scores from the provided parsed response XML.
 * @param {object} obj The object to use as root.
 * @param {string} type The type of activity aggregated - `'POSTS'`, `'LIKES'`, or `'LIKED'`.
 * @returns {RMBActivityAggregate[]} The built array.
 */
function parseRMBLeaderboard(obj, type) {
	if(obj.length != 1) return undefined;
	let ret = [];
	if(iterable(obj[0])) for(let n of obj[0]) ret.push({
		nation: txt(n, 'NAME'),
		score: num(n, type?.toUpperCase())
	});
	return ret;
}

/**
 * @typedef {object} RMBPost
 * Represents a message post lodged to a region's Regional Message Board.
 * @prop {number} id ID of the post.
 * @prop {string} nation Name of the nation that made the post.
 * @prop {string} text Body text of the post.
 * @prop {number} likes Current number of likes on the post.
 * @prop {string[]} likers List with the names of the nations that liked the post.
 * @prop {number} timestamp Unix epoch timestamp of when the post was made.
 * @prop {number} status {@linkcode RMBPostStatus} of the post.
 * @prop {string | null} suppressor Name of the nation that suppressed the post, if suppressed.
 */
/**
 * Builds a RMB post object from the provided parsed response XML.
 * @param {object} msg The root object - the `<MESSAGE>` tag in the parsed XML object.
 * @returns {RMBPost} The built post object.
 */
function parseRMBMessage(msg) {
	return {
		id: parseInt(attr(msg, 'ID')),
		nation:		txt(msg, 'NATION'),
		text:		txt(msg, 'MESSAGE'),
		likes:		num(msg, 'LIKES'),
		likers:		txt(msg, 'LIKERS')?.split(',') || [],
		timestamp:	num(msg, 'TIMESTAMP'),
		status:		num(msg, 'STATUS'),
		suppressor:	txt(msg, 'SUPPRESSOR') || null
	};
}

/**
 * @typedef {object} SectorData
 * Container object for data on contribution to a nation's GDP by percentage per sector.
 * @prop {number} blackMarket Percentage of GDP generated by black market activity.
 * @prop {number} government Percentage of GDP generated by direct government activity.
 * @prop {number} private Percentage of GDP generated by privately-owned industry.
 * @prop {number} stateOwned Percentage of GDP generated by state-owned industry.
 */
/**
 * Builds a sectors data object from the provided parsed response XML.
 * @param {object} root The root object - the `<SECTORS>` tag in the parsed XML object.
 * @returns {SectorData} The built sectors data object.
 */
function parseSectors(root) {
	return {
		blackMarket:num(root, 'BLACKMARKET'),
		government:	num(root, 'GOVERNMENT'),
		private:	num(root, 'INDUSTRY'),
		stateOwned:	num(root, 'PUBLIC')
	};
}

/**
 * @typedef {object} SpendingData
 * Container object for data on a nation's government expenditure by percentage per field.
 * @prop {number} admin Percentage of budget spent on the bureaucracy.
 * @prop {number} defence Percentage of budget spent on defence.
 * @prop {number} education Percentage of budget spent on education.
 * @prop {number} nature Percentage of budget spent on environmental stuff.
 * @prop {number} healthcare Percentage of budget spent on the healthcare system.
 * @prop {number} industry Percentage of budget spent on corporate welfare.
 * @prop {number} aid Percentage of budget spent on providing international aid.
 * @prop {number} order Percentage of budget spent on law enforcement.
 * @prop {number} transport Percentage of budget spent on the public transport system.
 * @prop {number} social Percentage of budget spent on social policy.
 * @prop {number} religion Percentage of budget spent on spiritual policy.
 * @prop {number} welfare Percentage of budget spent on the welfare system.
 */
/**
 * Builds a spending object from the provided parsed response XML.
 * @param {object} root The root object - the `<GOVT>` tag in the parsed XML object.
 * @returns {SpendingData} The built spending object.
 */
function parseSpending(root) {
	return {
		admin:		num(root, 'ADMINISTRATION'),
		defence:	num(root, 'DEFENCE'),
		education:	num(root, 'EDUCATION'),
		nature:		num(root, 'ENVIRONMENT'),
		healthcare:	num(root, 'HEALTHCARE'),
		industry:	num(root, 'COMMERCE'),
		aid:		num(root, 'INTERNATIONALAID'),
		order:		num(root, 'LAWANDORDER'),
		transport:	num(root, 'PUBLICTRANSPORT'),
		social:		num(root, 'SOCIALEQUALITY'),
		religion:	num(root, 'SPIRITUALITY'),
		welfare:	num(root, 'WELFARE')
	};
}

/**
 * @typedef {object} IssueSummary
 * Represents an issue by title and ID.
 * @prop {number} id ID of the issue.
 * @prop {string} title Title of the issue, shown as a newspaper headline.
 */
/**
 * Builds an issue summary object from the provided parsed response XML.
 * @param {object} issue The root object - an `<ISSUE>` tag in the parsed XML object.
 * @returns {IssueSummary} The built issue summary object.
 */
function parseSummary(issue) {
	return {
		id: parseInt(attr(issue, 'ID')),
		title: issue['$text']
	};
}

/**
 * @typedef {object} Trade
 * Represents the transfer of a card from one nation to another, whether by gift or auction.
 * This type of trade object is used for trade lists on the open market.
 * @prop {ListCard} card The card transferred.
 * @prop {string} buyer Name of the nation that received the card.
 * @prop {string} seller Name of the nation that gave the card.
 * @prop {number | null} price Amount of bank the buyer paid; `null` for gifts.
 * @prop {number} timestamp Unix epoch timestamp of when the transfer occurred.
 */
/**
 * Builds a trade object from the provided parsed response XML.
 * @param {object} trade The root object - a `<TRADE>` tag in the parsed XML object.
 * @returns {Trade} The built trade object.
 */
function parseTrade(trade) {
	return {
		card:		parseCardOverview(trade),
		buyer:		txt(trade, 'BUYER'),
		seller:		txt(trade, 'SELLER'),
		price:		num(trade, 'PRICE') || null,
		timestamp:	num(trade, 'TIMESTAMP')
	}
}

/**
 * @typedef {object} TradeCardbound
 * Represents the transfer of a card from one nation to another, whether by gift or auction.
 * This type of trade object is used for trade lists from a specific card's page.
 * @prop {string} buyer Name of the nation that received the card.
 * @prop {string} seller Name of the nation that gave the card.
 * @prop {number | null} price Amount of bank the buyer paid; `null` for gifts.
 * @prop {number} timestamp Unix epoch timestamp of when the transfer occurred.
 */
/**
 * Builds a trade object from the provided parsed response XML.
 * @param {object} trade The root object - a `<TRADE>` tag in the parsed XML object.
 * @returns {TradeCardbound} The built trade object.
 */
function parseTradeCardbound(trade) {
	return {
		buyer:		txt(trade, 'BUYER'),
		seller:		txt(trade, 'SELLER'),
		price:		num(trade, 'PRICE') || null,
		timestamp:	num(trade, 'TIMESTAMP')
	};
}

/**
 * @typedef {object} TGQueue
 * Container object specifying the total number of telegrams that are currently awaiting delivery,
 * sorted by the type of queue each.
 * @prop {number} manual Total number of manually-sent telegrams awaiting delivery.
 * @prop {number} mass Total number of mass telegrams awaiting delivery.
 * @prop {number} api Total number of telegrams sent via the API awaiting delivery.
 */
/**
 * Builds a queue object from the provided parsed response XML.
 * @param {object} queue The root object - the `<TGQUEUE>` tag in the parsed XML object.
 * @returns {TGQueue} The built queue object.
 */
function parseTGQueue(queue) {
	return {
		manual:	num(queue, 'MANUAL'),
		mass:	num(queue, 'MASS'),
		api:	num(queue, 'API')
	};
}

/**
 * @typedef {object} UnreadsData
 * Container object for data on a nation's number of unread issues, telegrams, notices, and RMB and
 * News posts, as well as the number of at-vote resolutions it has yet to vote on.
 * @prop {number} issue Total number of issues currently confronting the nation.
 * @prop {number} telegram Total number of telegrams not yet read by the nation.
 * @prop {number} notice Total number of notices not yet acknowledged by the nation.
 * @prop {number} rmb Total number of unread posts on the RMB of the nation's region.
 * @prop {number} wa Number of at-vote WA resolutions that the nation has not yet voted on.
 * @prop {number} news Total number of posts on the news page that the nation hasn't read yet.
 */
/**
 * Builds an unreads data object from the provided parsed response XML.
 * @param {object} root The root object - the `<UNREADS>` tag in the parsed XML object.
 * @returns {UnreadsData} The built unreads data object.
 */
function parseUnreads(root) {
	return {
		issue:		num(root, 'ISSUES'),
		telegram:	num(root, 'TELEGRAMS'),
		notice:		num(root, 'NOTICES'),
		rmb:		num(root['RMB'], '$text'),
		wa:			num(root, 'WA'),
		news:		num(root, 'NEWS')
	};
}

/**
 * @typedef {object} VoteSummary
 * Container object holding data on current or final voting results on a {@linkcode Resolution}.
 * @prop {number} totalFor Total number of votes cast in favor of the resolution.
 * @prop {number} totalAgainst Total number of votes cast against the resolution.
 * @prop {number} totalIndividualFor Total number of nations voting in favor of the resolution.
 * @prop {number} totalIndividualAgainst Total number of nations voting against the resolution.
 * @prop {VoteTally[]} track Development of the vote totals over the course of voting.
 * @prop {VoterData} voters Names of the nations voting in favor of and against the resolution.
 * @prop {DelegateVoteSummary} delegates Details of the delegates having voted on the resolution.
 * @prop {DelegateLogVote[]} delegatesLog Full timeline of when each delegate cast their vote.
 */
/**
 * @typedef {object} VoterData
 * Container object holding data on the names of nations voting on a resolution.
 * @prop {string[]} for List with the names of all nations voting in favor of the resolution.
 * @prop {string[]} against List with the names of all nations voting against the resolution.
 */
/**
 * Builds a vote summary object from the provided parsed response XML.
 * @param {object} r The root object - the `<RESOLUTION>` tag in the parsed XML object.
 * @returns {VoteSummary} The built vote summary object.
 */
function parseVoteData(r) {

	// Sub-shard 'votetrack'
	let track = undefined;
	if(r['VOTE_TRACK_FOR'] && r['VOTE_TRACK_AGAINST']) {
		track = [];
		for(let i = 0; i < r['VOTE_TRACK_FOR'].length; i++) track.push({
			for: parseInt(r['VOTE_TRACK_FOR'][i]),
			against: parseInt(r['VOTE_TRACK_AGAINST'][i])
		});
	}

	// Sub-shard 'voters'
	let voters = undefined;
	if(r['VOTES_FOR'] && r['VOTES_AGAINST']) voters = {
		for: r['VOTES_FOR'],
		against: r['VOTES_AGAINST']
	}

	// Sub-shard 'dellog'
	let dellog = r['DELLOG'] ? handleList(r['DELLOG'], parseDelegateLogVote) : undefined;

	// Sub-shard 'delvotes'
	let delvotes = r['DELVOTES_FOR'] && r['DELVOTES_AGAINST']
		? handle(r, parseDelegateVotes)
		: undefined;

	return {
		totalFor: num(r, 'TOTAL_VOTES_FOR'),
		totalAgainst: num(r, 'TOTAL_VOTES_AGAINST'),
		totalIndividualFor: num(r, 'TOTAL_NATIONS_FOR'),
		totalIndividualAgainst: num(r, 'TOTAL_NATIONS_AGAINST'),
		track: track,
		voters: voters,
		delegates: delvotes,
		delegatesLog: dellog
	}
}

/**
 * @typedef {object} VoteTally
 * Represents a tally of votes For and Against a resolution in the World Assembly.
 * @prop {number} for Number of votes in favor of the resolution. `null` if none is at vote.
 * @prop {number} against Number of votes against the resolution. `null` if none is at vote.
 */
/**
 * Builds a vote tally object from the provided parsed response XML.
 * @param {object} tally The root object - a `<GAVOTE>` or `<SCVOTE>` tag in the parsed XML object.
 * @returns {VoteTally} The built vote tally object.
 */
function parseVoteTally(tally) {
	return {
		for: num(tally, 'FOR') || null,
		against: num(tally, 'AGAINST') || null
	};
}

/**
 * @typedef {object} ZombieDataNation
 * Container object for data on a nation's Z-Day behaviour.
 * @prop {string} intended The {@linkcode ZombieAction} the nation pursues.
 * @prop {string} action The {@linkcode ZombieAction} the nation is actually executing.
 * @prop {number} survivors Total number of citizens alive and well in the nation.
 * @prop {number} zombies Total number of zombified citizens in the nation.
 * @prop {number} dead Total number of deceased citizens in the nation.
 */
/**
 * Builds a zombie data object from the provided parsed response XML.
 * @param {object} root The root object - the `<ZOMBIE>` tag in the parsed XML object.
 * @returns {ZombieDataNation} The built zombie data object.
 */
function parseZombieNation(root) {
	return {
		action:		txt(root, 'ZACTION') || ZombieAction.INACTION,	// Sometimes they're empty, idk
		intended:	txt(root, 'ZACTIONINTENDED') || txt(root, 'ZACTION') || ZombieAction.INACTION,
		survivors:	num(root, 'SURVIVORS'),
		zombies:	num(root, 'ZOMBIES'),
		dead:		num(root, 'DEAD')
	}
}

/**
 * @typedef {object} ZombieDataRegion
 * Container object for data on the Z-Day performance of a region's resident nations.
 * @prop {number} survivors Total number of national citizens alive and well in the region.
 * @prop {number} zombies Total number of zombified national citizens in the region.
 * @prop {number} dead Total number of deceased national citizens in the region.
 */
/**
 * Builds a zombie data object from the provided parsed response XML.
 * @param {object} root The root object - the `<ZOMBIE>` tag in the parsed XML object.
 * @returns {ZombieDataRegion} The built zombie data object.
 */
function parseZombieRegion(root) {
	return {
		survivors:	num(root, 'SURVIVORS'),
		zombies:	num(root, 'ZOMBIES'),
		dead:		num(root, 'DEAD')
	}
}


/* === Exports === */

exports.handle		= handle;
exports.handleList	= handleList;
exports.iterable	= iterable;
exports.secureArray	= secureArray;

exports.attr	= attr;
exports.arr		= arr;
exports.num		= num;
exports.txt		= txt;

exports.parseAuction			= parseAuction;
exports.parseBadge				= parseBadge;
exports.parseBanner				= parseBanner;
exports.parseCardOverview		= parseCardOverview;
exports.parseCensusNation		= parseCensusNation;
exports.parseCensusRank			= parseCensusRank;
exports.parseCensusRankUnscored	= parseCensusRankUnscored;
exports.parseCensusRegion		= parseCensusRegion;
exports.parseCensusWorld		= parseCensusWorld;
exports.parseCollection			= parseCollection;
exports.parseCollectionOverview	= parseCollectionOverview;
exports.parseDeath				= parseDeath;
exports.parseDeckSummary		= parseDeckSummary;
exports.parseDispatch			= parseDispatch;
exports.parseDispatchOverview	= parseDispatchOverview;
exports.parseEmbassies			= parseEmbassies;
exports.parseFaction			= parseFaction;
exports.parseFactionDetails		= parseFactionDetails;
exports.parseFreedoms			= parseFreedoms;
exports.parseHappening			= parseHappening;
exports.parseHDI				= parseHDI;
exports.parseHistoryEvent		= parseHistoryEvent;
exports.parseIDHappening		= parseIDHappening;
exports.parseIssue				= parseIssue;
exports.parseMarket				= parseMarket;
exports.parseNewNationsDetails	= parseNewNationsDetails;
exports.parseNotice				= parseNotice;
exports.parseOfficer			= parseOfficer;
exports.parsePolicy				= parsePolicy;
exports.parsePoll				= parsePoll;
exports.parseProposal			= parseProposal;
exports.parseRankChange			= parseRankChange;
exports.parseReclassification	= parseReclassification;
exports.parseRMBLeaderboard		= parseRMBLeaderboard;
exports.parseRMBMessage			= parseRMBMessage;
exports.parseResolution			= parseResolution;
exports.parseSectors			= parseSectors;
exports.parseSpending			= parseSpending;
exports.parseSummary			= parseSummary;
exports.parseTrade				= parseTrade;
exports.parseTradeCardbound		= parseTradeCardbound;
exports.parseTGQueue			= parseTGQueue;
exports.parseUnreads			= parseUnreads;
exports.parseVoteTally			= parseVoteTally;
exports.parseZombieNation		= parseZombieNation;
exports.parseZombieRegion		= parseZombieRegion;
