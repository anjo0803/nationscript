/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const enums = require('./enums');
const shards = require('./shards');

/**
 * Type definitions of objects returned by NationScript.
 * @namespace types
 */

/**
 * Represents an ongoing auction on a card.
 * @typedef {object} Auction
 * @prop {number} id ID of the card being auctioned.
 * @prop {string} rarity {@link enums.Rarity Rarity} of the card.
 * @prop {string} nation Nation depicted on the card (`Proper Form`).
 * @prop {number} season ID of the season the card was inscribed for.
 * @memberof types
 */

/**
 * Represents a commendation, condemnation, liberation, or injunction badge
 * displayed on a nation or region.
 * @typedef {object} CardBadge
 * @prop {string} type {@link enums.CardBadgeType CardBadgeType} of the badge.
 * @prop {number} data For Commendation/Condemnation badges, the ID of the
 *     instituting SC resolution. For authorship and easter egg badges, the
 *     count of authorships/easter eggs found. For others, `1`.
 * @memberof types
 */

/**
 * Represents a commendation, condemnation, liberation, or injunction badge
 * displayed on a nation or region.
 * @typedef {object} WABadge
 * @prop {number} resolution ID of the SC resolution imposing the badge.
 * @prop {string} type {@link enums.WABadgeType WABadgeType} of the badge.
 * @memberof types
 */

/**
 * Represents a national banner.
 * @typedef {object} Banner
 * @prop {string} id ID of the banner.
 * @prop {string} name Full name of the banner.
 * @prop {string} condition Vague description of the banner's unlock condition.
 * @memberof types
 */

/**
 * Represents a card with only the most basic data present, as when displayed
 * as part of a listing of multiple cards.
 * @typedef {object} ListCard
 * @prop {number} id ID of the card (and the depicted nation).
 * @prop {string} rarity {@link enums.Rarity Rarity} of the card.
 * @prop {number} season ID of the season that the card was inscribed for.
 * @memberof types
 */

/**
 * Represents the wider card world of the NationStates multiverse, containing
 * all the data requested from the Card API.
 * @typedef {object} CardWorld
 * @prop {Auction[]} [auctions] Auctions currently going on.
 * @prop {Collection} [collectionDetail] The queried collection.
 * @prop {ListCollection[]} [collections] Collections owned by
 *     the queried nation.
 * @prop {ListCard[]} [cards] Cards in the deck of the queried nation.
 * @prop {Deck} [deckSummary] Summary of the queried nation's deck.
 * @prop {Trade[]} [trades] Trades matching the query filter.
 * @memberof types
 */

/**
 * Represents a nation depicted on a {@link types.Card Card}.
 * @typedef {object} CardNation
 * @prop {string} name Nation name (`Proper Form`).
 * @prop {string} motto National motto.
 * @prop {string} pretitle National pretitle.
 * @prop {string} region Region the nation resides in (`Proper Form`).
 * @prop {string} category World Census classification of the nation, e.g. *New
 *     York Times Democracy*.
 * @prop {string} flag URL of the nation's flag image file, relative to
 *     `https://www.nationstates.net/images/cards/sX/`, where `X` is the season
 *     of the card the depiction is on.
 * @memberof types
 */
/**
 * Represents a trading card in the NationStates multiverse, holding all the
 * data requested from the Cards API.
 * @typedef {object} Card
 * @prop {number} id Card ID; corresponds to the depicted nation's `dbID`.
 * @prop {number} season ID of the season the card was inscribed for.
 * @prop {number} value Market value of the card, calculated by the game.
 * @prop {string} rarity The card's {@link enums.Rarity Rarity}.
 * @prop {CardNation} [depicted] Details of the nation depicted on the card.
 * @prop {string[]} [owners] Names of nations owning a copy of the card
 *     (`id_form`). The number of times a nation appears corresponds to the
 *     number of copies that nation owns.
 * @prop {Market[]} [asksBids] Extant Asks and Bids ("Markets").
 * @prop {TradeCardbound[]} [trades] Transfers of the card that
 *     matched the query filter.
 * @memberof types
 */

/**
 * Container object for data on a nation's performance on a World Census scale.
 * @typedef {object} CensusDataNation
 * @prop {number} id {@link enums.CensusScale CensusScale} the rank is for.
 * @prop {number} score Raw score.
 * @prop {number} rankRegion Rank within the region.
 * @prop {number} rankRegionPercent Percentile within the region.
 * @prop {number} rankWorld Rank world-wide.
 * @prop {number} rankWorldPercent Percentile world-wide. 
 * @memberof types
 */

/**
 * Container object for data on a region's performance on a World Census scale,
 * depending on its residents' scores on it.
 * @typedef {object} CensusDataRegion
 * @prop {number} id {@link enums.CensusScale CensusScale} the rank is for.
 * @prop {number} average Average score of the region's residents on the scale.
 * @prop {number} rank Rank of the region on the scale.
 * @prop {number} rankPercent Percentile of the region on the scale. 
 * @memberof types
 */

/**
 * Container object for national score averages on a given World Census scale.
 * @typedef {object} WCensusAverage
 * @prop {number} id {@link enums.CensusScale CensusScale} the average is for.
 * @prop {number} average World-wide average score of nations on the scale.
 * @memberof types
 */

/**
 * Container object for census scale descriptions.
 * @typedef {object} CensusDescription
 * @prop {number} id {@link enums.CensusScale CensusScale} ID.
 * @prop {string} national Description of the scale's national rankings.
 * @prop {string} regional Description of the scale's regional rankings.
 * @memberof types
 */

/**
 * Container object for a nation's rank on a given World Census scale,
 * including the raw score, as returned by the
 * {@link shards.RegionShard.CENSUS_RANKS RegionShard.CENSUS_RANKS} and
 * {@link shards.WorldShard.CENSUS_RANKS WorldShard.CENSUS_RANKS} shards.
 * @typedef {object} CensusRankScored
 * @prop {string} nation Name of the nation (`id_form`).
 * @prop {number} rank Rank of the nation on the scale.
 * @prop {number} score Score of the nation on the scale.
 * @memberof types
 */

/**
 * Container object holding data on a nation's rank on the day's featured World
 * Census scale, without the raw score, as returned by the
 * {@link shards.NationShard.CENSUS_RANK_REGION NationShard.CENSUS_RANK_REGION}
 * and {@link shards.NationShard.CENSUS_RANK NationShard.CENSUS_RANK} shards.
 * @typedef {object} CensusRankUnscored
 * @prop {number} scale {@link CensusScale} the rank is for.
 * @prop {number} rank The rank of the nation.
 * @memberof types
 */

/**
 * Represents a collection of cards with only the most basic data present, as
 * when displayed as part of a listing of multiple collections.
 * @typedef {object} ListCollection
 * @prop {number} id ID of the collection.
 * @prop {string} name Name of the collection.
 * @prop {number} edited Timestamp of the last change to the collection.
 * @memberof types
 */

/**
 * Represents a collection of cards, in detailed form.
 * @typedef {object} Collection
 * @prop {string} name Name of the collection.
 * @prop {string} owner Nation that created the collection (`id_form`).
 * @prop {number} edited Timestamp of the last change to the collection.
 * @prop {ListCard[]} cards List of cards in the collection.
 * @memberof types
 */

/**
 * Represents a cause of death with its prevalence in a nation.
 * @typedef {object} DeathData
 * @prop {string} cause {@link enums.DeathCause DeathCause} the data describes.
 * @prop {number} percent Percentage of deaths in the nation due to the cause.
 * @memberof types
 */

/**
 * Represents a nation's deck of trading cards.
 * @typedef {object} Deck
 * @prop {number} nationID Database ID of the nation that owns the deck.
 * @prop {string} nationName Name of the nation that owns the deck (`id_form`).
 * @prop {number} bank Amount of bank the deck owner currently has.
 * @prop {number} capacity Maximum number of cards that may be in the deck.
 * @prop {number} numCards Number of cards currently in the deck.
 * @prop {number} value Total market value of all cards currently in the deck.
 * @prop {number} valueTime Timestamp of when the deck's value was assessed.
 * @prop {number} rank World-wide rank of the deck according to value.
 * @prop {number} rankRegion Region-wide rank of the deck according to value.
 * @prop {number} lastPack Timestamp of when the deck owner last opened a pack
 *     of cards.
 * @memberof types
 */

/**
 * Represents a dispatch, without its body text.
 * @typedef {object} ListDispatch
 * @prop {number} id ID of the dispatch.
 * @prop {string} title The dispatch's title.
 * @prop {string} author Nation that published the dispatch (`id_form`).
 * @prop {string} categoryTop {@link enums.DispatchCategory DispatchCategory}
 *     of the dispatch.
 * @prop {string} categorySub {@link enums.DispatchSubcategory DispatchSubcategory}
 *     of the dispatch.
 * @prop {number} posted Timestamp of the dispatch's original publication.
 * @prop {number} edited Timestamp of the last edit to the dispatch. If there
 *     haven't been any edits, `0`.
 * @prop {number} views Number of views on the dispatch.
 * @prop {number} score The dispatch's score - upvotes minus downvotes.
 * @memberof types
 */

/**
 * Represents a dispatch.
 * @typedef {object} Dispatch
 * @prop {number} id ID of the dispatch.
 * @prop {string} title The dispatch's title.
 * @prop {string} author Nation that published the dispatch (`id_form`).
 * @prop {string} categoryTop {@link enums.DispatchCategory DispatchCategory}
 *     of the dispatch.
 * @prop {string} categorySub {@link enums.DispatchSubcategory DispatchSubcategory}
 *     of the dispatch.
 * @prop {string} body Body text of the dispatch.
 * @prop {number} posted Timestamp of the dispatch's original publication.
 * @prop {number} edited Timestamp of the last edit to the dispatch. If there
 *     haven't been any edits, `0`.
 * @prop {number} views Number of views on the dispatch.
 * @prop {number} score The dispatch's score - upvotes minus downvotes.
 * @memberof types
 */

/**
 * Represents a trading card in the NationStates multiverse, containing all the
 * data saved for the card in the requested season's one-off Dump.
 * @typedef {object} DumpCard
 * @prop {number} id Card ID; corresponds to the depicted nation's `dbID`.
 * @prop {CardNation} depicted Details of the nation depicted
 *     on the card.
 * @prop {string} rarity The card's {@link enums.Rarity Rarity}.
 * @prop {Trophy[]} trophies Displayed World Census ranking trophies.
 * @prop {CardBadge[]} badges Displayed miscellaneous badges.
 * @memberof types
 */

/**
 * Represents a nation in the NationStates multiverse, containing all the data
 * saved for the nation in the requested Daily Dump.
 * @typedef {object} DumpNation
 * @prop {string} name Name of the nation (`Proper Form`).
 * @prop {string} pretitle National pretitle.
 * @prop {string} nameFull Full name of the nation (`Proper Form`).
 * @prop {string} motto National motto.
 * @prop {string} category World Census category of the nation, e.g. *New York
 *     Times Democracy*.
 * @prop {string} waStatus {@link enums.WAStatus WAStatus} of the nation.
 * @prop {string[]} endorsements Nations endorsing this nation (`id_form`).
 * @prop {number} issuesAnswered Number of issues the nation has answered.
 * @prop {FreedomsTextData} freedomDescriptions Textual
 *     descriptions of the freedom levels in the nation.
 * @prop {string} region Region the nation resides in (`Proper Form`).
 * @prop {number} population Number of citizens the nation has, in millions.
 * @prop {number} tax Average income tax rate in the nation.
 * @prop {string} animal National animal of the nation.
 * @prop {string} currency Name of the nation's currency.
 * @prop {string} demonymAdjective The adjective demonym for the nation.
 * @prop {string} demonymNoun The singluar noun demonym for the nation.
 * @prop {string} demonymPlural The plural noun demonym for the nation.
 * @prop {string} flag Absolute URL of the national flag image file.
 * @prop {string} majorIndustry Largest industry in the nation.
 * @prop {string} spendingPriority Single largest field within the nation's
 *     {@link DumpNation#expenditure expenditure}.
 * @prop {SpendingData} expenditure Details of national
 *     government expenditure.
 * @prop {string} founded Textual description of when the nation was founded,
 *     relative to now.
 * @prop {number} firstLogin Timestamp of the nation's first login.
 * @prop {string} lastLogin Textual description of the time of the nation's
 *     last login, relative to now.
 * @prop {number} lastLoginTimestamp Timestamp of the nation's last login.
 * @prop {string} influence {@link Influence} the nation has in its region.
 * @prop {FreedomsScoreData} freedomScores Scores for the
 *     freedom levels in the nation.
 * @prop {number} gdpGovernment Percentage of the nation's GDP that is
 *     generated directly by government action.
 * @prop {DeathData} deaths Details on the causes of death in the
 *     nation.
 * @prop {string} leader Name of the national leader.
 * @prop {string} capital Name of the national capital.
 * @prop {string} religion Name of the national religion.
 * @prop {number} factbookNum Number of extant factbooks the nation authored.
 * @prop {number} dispatchNum Number of extant dispatches the nation wrote.
 * @prop {number} dbID Database ID of the nation.
 * @memberof types
 */

/**
 * Represents a region in the NationStates multiverse, containing all the data
 * saved for the region in the requested Daily Dump.
 * @typedef {object} DumpRegion
 * @prop {?string} bannerID ID of the regional banner. If the region doesn't
 *     fly a custom banner, `null`.
 * @prop {string} bannerURL Relative URL of the regional banner image file.
 * @prop {?string} delegateName Nation serving as the regional WA Delegate
 *     (`id_form`). If there is no Delegate, `null`.
 * @prop {string[]} delegateAuthorities {@link enums.OfficerAuthority OfficerAuthority} codes for the
 *     office of regional WA Delegate.
 * @prop {number} delegateVotes Number of votes the regional WA Delegate has.
 * @prop {string} wfe Body text of the region's World Factbook Entry.
 * @prop {string} flag Absolute URL of the regional flag image file.
 * @prop {boolean} isFrontier `true` if the region is a frontier, otherwise
 *     `false`.
 * @prop {?string} governor Nation serving as the regional governor
 *     (`id_form`). If the region has no governor, `null`.
 * @prop {number} updateLast Timestamp of when the region last updated.
 * @prop {number} updateMajor Timestamp of when the region last updated in the
 *     course of a Major update.
 * @prop {number} updateMinor Timestamp of when the region last updated in the
 *     course of a Minor update.
 * @prop {string} name Name of the region (`Proper Form`).
 * @prop {string[]} nations Nations residing in the region (`id_form`).
 * @prop {number} nationsNum Number of nations residing in the region.
 * @prop {string} powerLevel Textual description of the total influence among
 *     nations in the region.
 * @prop {Embassy} embassies Embassies the region has with
 *     others.
 * @prop {?string} founder Nation that founded the region (`id_form`). If there
 *     is no founder, `null`.
 * @prop {Officer[]} officers Regional officers.
 * @memberof types
 */

/**
 * Represents a regional embassy.
 * @typedef {object} Embassy
 * @prop {string} phase The embassy's current {@link enums.EmbassyPhase EmbassyPhase}.
 * @prop {string} region Region the embassy is for (`Proper Form`).
 * @memberof types
 */

/**
 * Represents an N-Day faction with only the most basic information present, as
 * when displayed as part of a listing of multiple factions. 
 * @typedef {object} ListFaction
 * @prop {number} id Faction ID.
 * @prop {string} name Faction name.
 * @prop {number} score Faction score.
 * @prop {string} region Name of the founding region (`Proper Form`).
 * @prop {number} numMembers Number of nations that are members of the faction.
 * @memberof types
 */

/**
 * Represents an N-Day faction.
 * @typedef {object} Faction
 * @prop {number} id Faction ID.
 * @prop {string} name Faction name.
 * @prop {string} description Faction description.
 * @prop {number} created Timestamp of the faction's founding.
 * @prop {string} region Name of the founding region (`Proper Form`).
 * @prop {number} entry 
 * @prop {number} score Faction score - `strikes` minus `radiation`.
 * @prop {number} strikes Number of nukes launched by faction members that
 *     successfully hit their target.
 * @prop {number} radiation Number of nukes that have hit faction members.
 * @prop {number} production Amount of production stored by faction members.
 * @prop {number} nukes Number of nukes stockpiled by faction members.
 * @prop {number} shields Number of shields stockpiled by faction members.
 * @prop {number} targets Number of nukes faction members are aiming.
 * @prop {number} launches Number of nukes faction members are launching.
 * @prop {number} targeted Number of nukes aimed at faction members.
 * @prop {number} incoming Number of nukes launched at faction members.
 * @memberof types
 */

/**
 * Container object holding descriptions on a nation's civil, economic, and
 * political freedoms.
 * @typedef {object} FreedomsTextData
 * @prop {string} civil The nation's civil rights situation.
 * @prop {string} economic Extent of economic freedom the nation grants.
 * @prop {string} political Level of the nation's political freedom.
 * @memberof types
 */

/**
 * Container object holding numerical data on a nation's civil, economic, and
 * political freedoms, all rounded to the nearest integer value.
 * @typedef {object} FreedomsScoreData
 * @prop {string} civil The nation's civil rights score.
 * @prop {string} economic The nation's economical freedom score.
 * @prop {string} political The nation's political freedom score.
 * @memberof types
 */

/**
 * Represents a happening event in the NationStates world.
 * @typedef {object} IDHappening
 * @prop {number} id Happening ID.
 * @prop {number} timestamp Timestamp of when the happening occurred.
 * @prop {string} text Description of what transpired in the happening.
 * @memberof types
 */

/**
 * Represents a happening event in the NationStates world.
 * @typedef {object} Happening
 * @prop {number} timestamp Timestamp of when the happening occurred.
 * @prop {string} text Description of what transpired in the happening.
 * @memberof types
 */

/**
 * Represents the outcome of the chosen answer on an issue.
 * @typedef {object} IssueEffect
 * @prop {number} issue ID of the issue that was answered.
 * @prop {number} option (Issue-internal) ID of the option that was chosen.
 * @prop {boolean} ok Whether everything went alright, I guess?
 * @prop {string} legislation The effect line of the chosen issue option.
 * @prop {string[]} headlines List of all generated newspaper headlines.
 * @prop {string[]} banners List of the banner codes of banners newly unlocked.
 * @prop {Policy[]} policiesEnacted List of all national
 *     policies newly enacted.
 * @prop {Policy[]} policiesCancelled List of all national
 *     policies newly rescinded.
 * @prop {RankChange[]} census List of changes to the nation's
 *     census scores.
 * @prop {Reclassification[]} reclassifications List of
 *     reclassifications of the nation's freedom levels.
 * @memberof types
 */

/**
 * Represents an issue by title and ID.
 * @typedef {object} ListIssue
 * @prop {number} id ID of the issue.
 * @prop {string} title Title of the issue, shown as a newspaper headline.
 * @memberof types
 */

/**
 * Represents an option that may be chosen to answer an issue.
 * @typedef {object} IssueOption
 * @prop {number} id Issue-internal ID of the option.
 * @prop {string} text Body text describing the option.
 * @memberof types
 */

/**
 * Represents an issue confronting a nation.
 * @typedef {object} Issue
 * @prop {number} id Issue ID.
 * @prop {string} title Issue title.
 * @prop {string} description Issue description - the problem to be solved.
 * @prop {IssueOption[]} options Available answer options.
 * @prop {string[]} author Names of the nations that authored the issue.
 * @prop {string[]} editor Names of the nations that edited the issue.
 * @prop {string} imageLarge Banner code of the large image shown on the issue.
 * @prop {string} imageSmall Banner code of the small image shown on the issue.
 * @memberof types
 */

/**
 * Container object holding data on a proposal's current legal status - that
 * is, the decisions of Moderators or members of the GA General Secretariat on
 * the proposal's compliance with the SC/GA ruleset.
 * @typedef {object} LegalityData
 * @prop {string[]} legal Nations ruling the proposal legal (`id_form`).
 * @prop {string[]} illegal Nations ruling the proposal illegal (`id_form`).
 * @prop {string[]} discard Nations voting to discard the proposal (`id_form`).
 * @prop {LegalityDecision[]} log Log of rulings made on the
 *     proposal.
 * @memberof types
 */

/**
 * Represents a ruling of a Moderator or a member of the General Secretariat
 * concerning the legality of a concrete {@link types.Proposal Proposal}.
 * @typedef {object} LegalityDecision
 * @prop {string} nation Nation that made the ruling (`id_form`).
 * @prop {string} ruling The {@link LegalityRuling} made.
 * @prop {string} reason Comment attached to the ruling.
 * @prop {number} timestamp Timestamp of when the ruling was made.
 * @memberof types
 */

/**
 * Represents an ask or bid on a card in the auction house.
 * @typedef {object} Market
 * @prop {string} nation Nation entertaining this market (`id_form`).
 * @prop {number} bank Amount of bank this market is worth.
 * @prop {boolean} isAsk `true` if the market is an Ask, `false` if it's a Bid.
 * @prop {number} timestamp Timestamp of when this market was created.
 * @memberof types
 */

/**
 * Container object holding data on the different component scores that
 * ultimately combine into a nation's final World Census HDI score.
 * @typedef {object} HDIData
 * @prop {number} score The final HDI score.
 * @prop {number} economy The economic score component.
 * @prop {number} education The educational score component.
 * @prop {number} lifespan The life expectancy score component.
 * @memberof types
 */
/**
 * Represents a nation in the NationStates multiverse, containing all the data
 * requested from the Nation API.
 * @typedef Nation
 * @prop {string} idForm Name of this nation in `id_form`.
 * @prop {string} [admirable] A random {@link enums.Admirable Admirable} the
 *     nation is eligible for.
 * @prop {string[]} [admirables] All {@link enums.Admirable Admirable}s the
 *     nation is eligible for.
 * @prop {string} [animal] National animal of the nation.
 * @prop {string} [animalTrait] Behaviour of the national animal.
 * @prop {string} [banner] Banner code of the banner to display for the nation.
 *     If the nation has set a primary banner, this is always the code of that
 *     primary banner; otherwise, it is randomly selected from all banners the
 *     nation has unlocked and not turned off.
 * @prop {string[]} [banners] Banner codes of all banners the nation has
 *     unlocked and not turned off. If the nation has set a primary banner, the
 *     banner code of it is listed first.
 * @prop {string} [category] World Census category of the nation, e.g. *New
 *     York Times Democracy*.
 * @prop {string} [crime] Textual description of crime levels in the nation.
 * @prop {string} [currency] Name of the nation's currency.
 * @prop {number} [dbID] Database ID of the nation.
 * @prop {string} [demonymAdjective] The adjective demonym for the nation.
 * @prop {string} [demonymNoun] The singluar noun demonym for the nation.
 * @prop {string} [demonymPlural] The plural noun demonym for the nation.
 * @prop {number} [dispatchNum] Number of extant dispatches the nation wrote.
 * @prop {string[]} [dossierNations] Nations in the dossier of the nation
 *     (`id_form`).
 * @prop {string[]} [endorsements] Nations endorsing this nation (`id_form`).
 * @prop {number} [factbookNum] Number of extant factbooks the nation authored.
 * @prop {number} [firstLogin] Timestamp of the nation's first login.
 * @prop {string} [flag] Absolute URL of the national flag image file.
 * @prop {string} [founded] Textual description of when the nation was founded,
 *     relative to now.
 * @prop {number} [foundedTimestamp] Timestamp of the nation's founding.
 * @prop {string} [nameFull] Full name of the nation.
 * @prop {string} [voteGA] {@link WAVote} of the nation in the GA.
 * @prop {number} [gdp] GDP of the nation.
 * @prop {string} [government] Textual description of what the national
 *     government is doing.
 * @prop {string} [spendingPriority] Single largest field within the nation's
 *     {@link Nation#expenditure expenditure}.
 * @prop {number} [incomeAverage] Average income of national citizens.
 * @prop {string} [descriptionIndustry] Textual description of the economic
 *     situation in the nation.
 * @prop {string} [influence] {@link enums.Influence Influence} level of the
 *     nation in its region.
 * @prop {number} [issuesAnswered] Number of issues the nation has answered.
 * @prop {string} [lastLogin] Textual description of the time of the nation's
 *     last login, relative to now.
 * @prop {number} [lastLoginTimestamp] Timestamp of the nation's last login.
 * @prop {string[]} [legislation] Effect lines of the nation's four most
 *     recently answered issues.
 * @prop {string} [majorIndustry] Largest industry in the nation.
 * @prop {string} [motto] National motto.
 * @prop {string} [name] Name of the nation (`Proper Form`).
 * @prop {string} [nextIssue] Textual description of when the nation will face
 *     its next issue, relative to now.
 * @prop {number} [nextIssueTime] Timestamp for when the nation will face its
 *     next issue.
 * @prop {string} [notable] A random {@link enums.Notable Notable} the nation
 *     is eligible for.
 * @prop {string[]} [notables] All {@link enums.Notable Notable}s the nation is
 *     eligible for.
 * @prop {number} [packs] Number of unopened card packs the nation has.
 * @prop {boolean} [ping] `true` if the ping to the nation was successful,
 *     otherwise `false`.
 * @prop {number} [incomePoorest] Average income of the poorest 10% of national
 *     citizens.
 * @prop {number} [population] Number of citizens the nation has, in millions.
 * @prop {number} [gdpGovernment] Percentage of the nation's GDP that is
 *     generated directly by government action.
 * @prop {string[]} [dossierRegions] Regions in the dossier of the nation
 *     (`id_form`).
 * @prop {string} [region] Region the nation resides in (`Proper Form`).
 * @prop {number} [incomeRichest] Average income of the richest 10% of national
 *     citizens.
 * @prop {string} [voteSC] {@link WAVote} of the nation in the SC.
 * @prop {string[]} [sensibilities] All {@link enums.Sensibility} traits of the
 *     nation's citizens.
 * @prop {number} [tax] Average income tax rate in the nation.
 * @prop {boolean} [receivesCampaign] `true` if the nation would accept the
 *     defined campaign telegram, otherwise `false`.
 * @prop {boolean} [receivesRecruit] `true` if the nation would accept the
 *     defined recruitment telegram, otherwise `false`.
 * @prop {string} [pretitle] National pretitle.
 * @prop {string} [waStatus] {@link enums.WAStatus WAStatus} of the nation.
 * @prop {string} [capital] Name of the national capital.
 * @prop {string} [capitalCustom] Custom name for the national capital, if set.
 * @prop {string} [leader] Name of the national leader.
 * @prop {string} [leaderCustom] Custom name for the national capital, if set.
 * @prop {string} [religion] Name of the national religion.
 * @prop {string} [religionCustom] Custom name for the national religion, if
 *     set.
 * @prop {boolean} [verified] `true` if a login of the nation was successfully
 *     verified, otherwise `false`.
 * @prop {CensusDataNation[]} [census] Performance of the nation on the queried
 *     {@link enums.CensusScale CensusScale}s.
 * @prop {DeathData} [deaths] Details on the causes of death in the nation.
 * @prop {ListDispatch} [dispatchList] Extant dispatches the
 *     nation authored.
 * @prop {ListDispatch} [factbookList] Extant factbooks the nation
 *     authored.
 * @prop {FreedomsTextData} [freedomDescriptions] Textual
 *     descriptions of the freedom levels in the nation.
 * @prop {FreedomsScoreData} [freedomScores] Scores for the
 *     freedom levels in the nation.
 * @prop {SpendingData} [expenditure] Details of national
 *     government expenditure.
 * @prop {Happening[]} [happenings] Recent national happening events.
 * @prop {HDIData} [hdi] Composition of the nation's HDI score.
 * @prop {Issue[]} [issues] Issues currently confronting the nation.
 * @prop {ListIssue[]} [issueSummaries] Titles and IDs of issues currently
 *     confronting the nation.
 * @prop {Notice[]} [notices] Notices of the nation.
 * @prop {Policy[]} [policies] National policies.
 * @prop {CensusRankUnscored} [censusRankRegion] Rank of the
 *     nation on the day's featured {@link enums.CensusScale CensusScale} among region-mates.
 * @prop {SectorsData} [sectors] Composition of the nation's GDP,
 *     by sector.
 * @prop {UnreadsData} [unreads] Stuff not yet acknowledged by the
 *     nation.
 * @prop {WABadge[]} [badges] Badges awarded to the nation by the SC.
 * @prop {CensusRankUnscored} [censusRank] Rank of the
 *     nation on the day's featured {@link enums.CensusScale CensusScale} world-wide.
 * @prop {ZombieDataNation} [zombie] Details on the national
 *     Z-Day performance.
 * @memberof types
 */

/**
 * Represents the founding details of a newly founded nation.
 * @typedef {object} NewNation
 * @prop {string} nation Name of the nation (`id_style`).
 * @prop {string} region Name of the nation's founding region (`id_style`).
 * @prop {number} founded Timestamp of the founding.
 * @memberof types
 */

/**
 * Represents a notice alert generated for a nation.
 * @typedef {object} Notice
 * @prop {string} title Notice title.
 * @prop {string} text Notice description.
 * @prop {number} time Timestamp of notice generation.
 * @prop {string} type {@link enums.NoticeType NoticeType} of the notice.
 * @prop {string} icon Displayed {@link enums.NoticeIcon NoticeIcon}.
 * @prop {string} url URL to open when the notice is clicked.
 * @prop {string} who Nation who caused the notice to be generated (`id_form`).
 * @prop {boolean} isNew `true` if viewed before, otherwise `false`.
 * @prop {boolean} ok No idea.
 * @memberof types
 */

/**
 * Represents a regional officer of a region.
 * @typedef {object} Officer
 * @prop {string} nation Nation holding the office (`id_form`).
 * @prop {string} office Name of the office.
 * @prop {string} appointer Nation that appointed the officer (`id_form`).
 * @prop {string[]} authorities {@link enums.OfficerAuthority OfficerAuthority}
 *     codes for the officer.
 * @prop {number} appointment Timestamp of the officer's appointment.
 * @prop {number} order Position on which the officer is displayed (1-indexed).
 * @memberof types
 */

/**
 * Represents a national policy.
 * @typedef {object} Policy
 * @prop {string} category General field the policy concerns.
 * @prop {string} name Name of the policy.
 * @prop {string} description Short description of the policy content.
 * @prop {string} image ID of the policy banner image.
 * @memberof types
 */

/**
 * Represents a voting option on a regional poll.
 * @typedef {object} PollOption
 * @prop {number} id Poll-internal ID of this option.
 * @prop {string} text Text of this option.
 * @prop {number} votes Number of votes for this option.
 * @prop {string[]} voters Nations voting for this option (`id_form`).
 * @memberof types
 */

/**
 * Represents a regional poll.
 * @typedef {object} Poll
 * @prop {number} id Poll ID.
 * @prop {string} title Poll title.
 * @prop {string} [description] Poll description.
 * @prop {string} author Nation that created the poll (`id_form`).
 * @prop {string} region Region that the poll is running in (`id_form`).
 * @prop {number} opens Timestamp for when the poll opens.
 * @prop {number} closes Timestamp for when the poll closes.
 * @prop {PollOption[]} options The available answer options.
 * @memberof types
 */

/**
 * Represents a proposal for a new resolution currently before the delegates of
 * the World Assembly.
 * @typedef {object} Proposal
 * @prop {string} id Proposal ID.
 * @prop {string} title Proposal title.
 * @prop {string} author Nation that submitted the proposal (`id_form`).
 * @prop {string[]} coauthors List of co-authoring nations (`id_form`).
 * @prop {string} text Body text of the proposal.
 * @prop {string[]} approvals WA delegates approving the proposal (`id_form`).
 * @prop {number} submitted Timestamp of proposal submission.
 * @prop {string} category Category of the resolution.
 * @prop {string} option For GA resolutions and SC declarations, the
 *     subcategory of the resolution; otherwise its target nation or region
 *     (`id_form`).
 * @prop {LegalityData} legality Rulings on the proposal's legality.
 * @memberof types
 */

/**
 * Represents a change in a nation's performance on a World Census scale.
 * @typedef {object} RankChange
 * @prop {number} scale Affected {@link enums.CensusScale CensusScale}.
 * @prop {number} changeAbsolute Score change on the scale in its units.
 * @prop {number} changeRelative Score change on the scale in percent.
 * @prop {number} newScore New (absolute) score on the scale.
 * @memberof types
 */

/**
 * Represents a reclassification of a nation's level of civil, economic, or
 * political freedom through an {@link AnsweredIssue}.
 * @typedef {object} Reclassification
 * @prop {number} category The
 *     {@link enums.ReclassificationCategory ReclassificationCategory}.
 * @prop {string} from Level of the freedom prior to answering the issue.
 * @prop {string} to Level of the freedom after answering the issue.
 * @memberof types
 */

/**
 * Represents a region in the NationStates multiverse, containing all the data
 * requested from the Region API.
 * @typedef {object} Region
 * @prop {string} idForm Name of this region in `id_form`.
 * @prop {string[]} [banlist] Nations on the region's banlist (`id_form`).
 * @prop {?string} [bannerID] ID of the regional banner. If the region doesn't
 *     fly a custom banner, `null`.
 * @prop {string} [bannerCreator] Nation that set the regional banner
 *     (`id_form`).
 * @prop {string} [bannerURL] Relative URL of the regional banner image file.
 * @prop {number} [dbID] Database ID of the region.
 * @prop {number[]} [pinnedDispatches] IDs of dispatches currently pinned to
 *     the region's WFE.
 * @prop {?string} [delegateName] Nation serving as the regional WA Delegate
 *     (`id_form`). If there is no Delegate, `null`.
 * @prop {string[]} [delegateAuthorities] The WA Delegate's
 *     {@link enums.OfficerAuthority OfficerAuthority} codes.
 * @prop {number} [delegateVotes] Number of votes the regional WA Delegate has.
 * @prop {string} [crossposting] The region's embassy
 *     {@link enums.CrosspostingPolicy CrosspostingPolicy}.
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
 * @prop {string[]} [tags] {@link enums.Tag Tag}s the region has.
 * @prop {CensusDataRegion[]} [census] Performance of the
 *     region on the queried {@link enums.CensusScale CensusScale}s.
 * @prop {CensusRankScored[]} [censusRanks] Resident nations ranked
 *     by their score on the queried {@link enums.CensusScale CensusScale}.
 * @prop {Embassy} [embassies] Embassies the region has with others.
 * @prop {?string} [founder] Nation that founded the region (`id_form`). If
 *     there is no founder, `null`.
 * @prop {VoteTally} [voteGA] Tally of votes For and Against the
 *     at-vote GA resolution by resident WA members.
 * @prop {Happening[]} [happenings] Recent regional happening events.
 * @prop {Happening[]} [history] Significant happening events from
 *     the regional history.
 * @prop {RMBPost[]} [messages] RMB posts that matched the RMB post
 *     query.
 * @prop {RMBActivity[]} [rmbMostPosts] Nations' aggregate posting
 *     activity on the region's RMB, as queried.
 * @prop {RMBActivity[]} [rmbMostLikesGiven] Nations' aggregate
 *     likes given on the region's RMB, as queried.
 * @prop {RMBActivity[]} [rmbMostLikesReceived] Nations' aggregate
 *     likes received on the region's RMB, as queried.
 * @prop {Officer[]} [officers] Regional officers.
 * @prop {Poll} [poll] Currently active regional poll.
 * @prop {VoteTally} [voteSC] Tally of votes For and Against the
 *     at-vote SC resolution by resident WA members.
 * @prop {WABadge[]} [badges] Badges awarded to the region by the SC.
 * @prop {ZombieDataRegion} [zombie] Details of the regional
 *     Z-Day performance.
 * @memberof types
 */

/**
 * Container for ordering vote data by votes For and Against.
 * @typedef {{for: Type, against: Type}} ForAgainst
 * @template {any} Type
 * @memberof types
 */
/**
 * Container object holding data on the state of voting a resolution.
 * @typedef {object} VoteSummary
 * @prop {ForAgainst<number>} total Vote totals.
 * @prop {ForAgainst<number[]>} [track] Progression of vote totals, array
 *     entries representing the respective vote total in hourly intervals.
 * @prop {ForAgainst<string[]>} [nations] Names of individual voters.
 * @prop {ForAgainst<number>} [nationsNum] Numbers of individual voters.
 * @prop {ForAgainst<DelegateActiveVote>} [delegates] The
 *     details of regional delegates' standing votes.
 * @prop {DelegateLogVote[]} [delegatesLog] Historical log of
 *     regional delegates casting their votes.
 * @memberof types
 */
/**
 * Represents an at-vote or passed resolution in the World Assembly.
 * @typedef {object} Resolution
 * @prop {string} id Council-internal resolution ID. If the resolution has not
 *     been passed yet, this is its proposal ID.
 * @prop {number} [idOverall] Overall ID of the resolution. Both councils'
 *     resolutions are pooled together for the overall ID. Only available on
 *     passed resolutions.
 * @prop {string} title Resolution title.
 * @prop {string} author Nation that submitted the resolution (`id_form`).
 * @prop {string[]} coauthors List of co-authoring nations (`id_form`).
 * @prop {string} text Body text of the resolution.
 * @prop {number} submitted Timestamp of the resolution's submission.
 * @prop {number} [promoted] Timestamp of when voting started on the
 *     resolution. Only available on at-vote resolutions.
 * @prop {number} [implemented] Timestamp of the resolution's passage, if
 *     applicable.
 * @prop {number} [repealed] ID of the resolution this resolution was repealed
 *     by, if applicable.
 * @prop {string} category Category of the resolution.
 * @prop {string} option For GA resolutions and SC declarations, the
 *     subcategory of the resolution; otherwise its target nation or region
 *     (`id_form`).
 * @prop {VoteSummary} vote Data on the current votes on the resolution.
 * @memberof types
 */

/**
 * Container object holding data on a nation's aggregate RMB activity.
 * @typedef {object} RMBActivity
 * @prop {string} nation Nation the data is for (`id_form`).
 * @prop {number} score Aggregate score of the nation.
 * @memberof types
 */

/**
 * Represents a message post lodged to a region's Regional Message Board.
 * @typedef {object} RMBPost
 * @prop {number} id Post ID.
 * @prop {string} nation Nation that made the post (`id_form`).
 * @prop {string} text Body text of the post.
 * @prop {number} likes Number of likes on the post.
 * @prop {string[]} likers Nations that liked the post (`id_form`).
 * @prop {number} timestamp Timestamp of when the post was made.
 * @prop {number} status {@link enums.RMBPostStatus RMBPostStatus} of the post.
 * @prop {string} [suppressor] Nation that suppressed the post, if applicable.
 * @memberof types
 */

/**
 * Container object for data on the composition of a nation's GDP, by percent
 * generated by sector.
 * @typedef {object} SectorsData
 * @prop {number} blackMarket Percent generated by black market activity.
 * @prop {number} government Percent generated by direct government activity.
 * @prop {number} private Percent generated by privately-owned industry.
 * @prop {number} stateOwned Percent generated by state-owned industry.
 * @memberof types
 */

/**
 * Container object for data on a nation's government spending by field, in
 * percentages.
 * @typedef {object} SpendingData
 * @prop {number} admin Percentage spent on the bureaucracy.
 * @prop {number} defence Percentage spent on defence.
 * @prop {number} education Percentage spent on education.
 * @prop {number} nature Percentage spent on environmental stuff.
 * @prop {number} healthcare Percentage spent on the healthcare system.
 * @prop {number} industry Percentage spent on corporate welfare.
 * @prop {number} aid Percentage spent on providing international aid.
 * @prop {number} order Percentage spent on law enforcement.
 * @prop {number} transport Percentage spent on the public transport system.
 * @prop {number} social Percentage spent on social policy.
 * @prop {number} religion Percentage spent on spiritual policy.
 * @prop {number} welfare Percentage spent on the welfare system.
 * @memberof types
 */

/**
 * Container object specifying the total number of telegrams that are currently
 * awaiting delivery, divided by the type of queue.
 * @typedef {object} TGQueue
 * @prop {number} manual Number of manually-sent telegrams.
 * @prop {number} mass Number of mass telegrams.
 * @prop {number} api Number of telegrams sent via the API.
 * @memberof types
 */

/**
 * Represents the transfer of a card from one nation to another (whether by
 * gift or auction) from the view of a specific card's details page.
 * @typedef {object} TradeCardbound
 * @prop {string} buyer Nation that received the card (`id_form`).
 * @prop {string} seller Nation that gave the card (`id_form`).
 * @prop {number} price Amount of bank the receiver paid; `0.0` for gifts.
 * @prop {number} timestamp Timestamp of when the transfer occurred.
 * @memberof types
 */

/**
 * Represents the transfer of a card from one nation to another (whether by
 * gift or auction) from the view of the open market.
 * @typedef {object} Trade
 * @prop {ListCard} card The card transferred.
 * @prop {string} buyer Nation that received the card (`id_form`).
 * @prop {string} seller Nation that gave the card (`id_form`).
 * @prop {number} price Amount of bank the receiver paid; `0.0` for gifts.
 * @prop {number} timestamp Timestamp of when the transfer occurred.
 * @memberof types
 */

/**
 * Represents a commendation, condemnation, liberation, or injunction badge
 * displayed on a nation or region.
 * @typedef {object} Trophy
 * @prop {number} census {@link enums.CensusScale CensusScale} the trophy is
 *     for.
 * @prop {10|5|1} percent Percentile the trophy is for.
 * @prop {number} rank World-wide rank for the census.
 * @memberof types
 */

/**
 * Container object for data on a nation's number of unread issues, telegrams,
 * notices, and RMB and News posts, as well as the number of at-vote WA
 * resolutions it has not yet cast its vote on.
 * @typedef {object} UnreadsData
 * @prop {number} issue Number of pending issues.
 * @prop {number} telegram Number of unread telegrams.
 * @prop {number} notice Number of unread notices.
 * @prop {number} rmb Number of unread posts on the RMB of the nation's region.
 * @prop {number} wa Number of WA resolutions the nation has not yet voted on.
 * @prop {number} news Number of unread news page posts.
 * @memberof types
 */

/**
 * Represents an *extant* vote cast by a WA delegate on an at-vote resolution.
 * @typedef {object} DelegateActiveVote
 * @prop {string} delegate Name of the delegate (`id_form`).
 * @prop {number} weight Number of votes the delegate currently has.
 * @prop {number} timestamp Timestamp of when the vote was cast.
 * @memberof types
 */

/**
 * Represents a vote *historically* cast by a WA delegate on an at-vote
 * resolution. It may be the current vote, or have been updated since.
 * @typedef {object} DelegateLogVote
 * @prop {string} delegate Name of the delegate (`id_form`).
 * @prop {string} vote {@link enums.WAVote WAVote} cast by the delegate.
 * @prop {number} weight Number of votes the delegate currently has.
 * @prop {number} timestamp Timestamp of when the vote was cast.
 * @memberof types
 */

/**
 * Represents a regional tally of votes For and Against a resolution in the
 * World Assembly.
 * @typedef {object} VoteTally
 * @prop {number} for Number of votes in favor of the resolution.
 * @prop {number} against Number of votes against the resolution.
 * @memberof types
 */

/**
 * Represents a council of the World Assembly in the NationStates multiverse,
 * containing all the data requested from the World Assembly API.
 * @typedef {object} WorldAssembly
 * @prop {number} council The covered {@link enums.WACouncil WACouncil}.
 * @prop {string} [lastResolution] Description of the result of the last vote.
 * @prop {string[]} [delegates] Currently serving WA delegates (`id_form`).
 * @prop {number} [delegatesNum] Number of currently serving WA delegates.
 * @prop {string[]} [members] Current WA member nations (`id_form`).
 * @prop {number} [membersNum] Number of current WA member nations.
 * @prop {Happening[]} [happenings] Recent WA happening events.
 * @prop {Proposal[]} [proposals] Current proposals.
 * @prop {Resolution} [resolution] Details of the at-vote (or the
 *     queried) resolution.
 * @memberof types
 */

/**
 * Represents the world of the NationStates multiverse, containing all the data
 * requested from the World API.
 * @typedef {object} World
 * @prop {number} [censusID] The day's featured
 *     {@link enums.CensusScale CensusScale}.
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
 * @prop {Banner[]} [banners] Details of the queried banners.
 * @prop {WCensusAverage[]} [censusAverages] Average national
 *     scores on the queried {@link enums.CensusScale CensusScale}.
 * @prop {string} [censusScale] Name of the units the queried
 *     {@link enums.CensusScale CensusScale} is measured in.
 * @prop {string} [censusTitle] Title of the queried
 *     {@link enums.CensusScale CensusScale}.
 * @prop {CensusDescription} [censusDescription] Info texts
 *     displayed for the queried {@link enums.CensusScale CensusScale}.
 * @prop {CensusRankScored[]} [censusRanks] Ranking of nations
 *     on the queried {@link enums.CensusScale CensusScale}.
 * @prop {Dispatch} [dispatch] Details of the queried dispatch.
 * @prop {ListDispatch[]} [dispatchList] Dispatches that matched
 *     the selected dispatch filters.
 * @prop {Faction} [faction] Details of the queried N-Day faction.
 * @prop {ListFaction[]} [factionList] Extant N-Day factions.
 * @prop {IDHappening[]} [happenings] Happening events that matched
 *     the selected happenings filters.
 * @prop {NewNation[]} [nationsNewDetails] Founding details of the 50
 *     most recently founded nations.
 * @prop {Poll} [poll] Details of the queried poll.
 * @prop {TGQueue} [tgQueue] Details of the telegram queue.
 * @memberof types
 */

/**
 * Container object for data on a nation's Z-Day performance.
 * @typedef {object} ZombieDataNation
 * @prop {string} intended {@link enums.ZombieAction ZombieAction} the nation
 *     originally selected.
 * @prop {string} action {@link enums.ZombieAction ZombieAction} the nation is
 *     actually executing, possibly involuntarily.
 * @prop {number} survivors Millions of citizens alive and well.
 * @prop {number} zombies Millions of zombified citizens.
 * @prop {number} dead Millions of deceased citizens.
 * @memberof types
 */

/**
 * Container object for data on the Z-Day performance of a region's residents.
 * @typedef {object} ZombieDataRegion
 * @prop {number} survivors Millions of national citizens alive and well.
 * @prop {number} zombies Millions of zombified national citizens.
 * @prop {number} dead Millions of deceased national citizens.
 * @memberof types
 */

module.exports = {}
