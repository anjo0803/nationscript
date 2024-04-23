/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Main module of NationScript
 * @module nationscript
 */

const { NS } = require('./api');
exports.NS = NS;

const { NSCredential } = require('./requests/base');
exports.NSCredential = NSCredential;

/* === Enums === */

const ENUMS = require('./enums');
exports.Admirable = ENUMS.Admirable;
exports.CensusMode = ENUMS.CensusMode;
exports.CensusScale = ENUMS.CensusScale;
exports.CrosspostingPolicy = ENUMS.CrosspostingPolicy;
exports.DeathCause = ENUMS.DeathCause;
exports.DispatchCategory = ENUMS.DispatchCategory;
exports.DispatchSubcategory = ENUMS.DispatchSubcategory;
exports.DispatchSearchMode = ENUMS.DispatchSearchMode;
exports.EmbassyPhase = ENUMS.EmbassyPhase;
exports.HappeningsFilter = ENUMS.HappeningsFilter;
exports.Influence = ENUMS.Influence;
exports.LegalityRuling = ENUMS.LegalityRuling;
exports.NationCategory = ENUMS.NationCategory;
exports.Notable = ENUMS.Notable;
exports.NoticeIcon = ENUMS.NoticeIcon;
exports.NoticeType = ENUMS.NoticeType;
exports.OfficerAuthority = ENUMS.OfficerAuthority;
exports.Rarity = ENUMS.Rarity;
exports.ReclassificationCategory = ENUMS.ReclassificationCategory;
exports.RMBPostStatus = ENUMS.RMBPostStatus;
exports.Sensibility = ENUMS.Sensibility;
exports.Tag = ENUMS.Tag;
exports.WABadgeType = ENUMS.WABadgeType;
exports.WACategory = ENUMS.WACategory;
exports.WACouncil = ENUMS.WACouncil;
exports.WAStatus = ENUMS.WAStatus;
exports.WAVote = ENUMS.WAVote;
exports.ZombieAction = ENUMS.ZombieAction;

const { DumpMode } = require('./requests/dump');
exports.DumpMode = DumpMode;


/* === Shards === */

const SHARDS = require('./shards');
exports.CardDetailShard		= SHARDS.CardDetailShard;
exports.CardShard			= SHARDS.CardShard;
exports.NationShard			= SHARDS.NationShard;
exports.NationPrivateShard	= SHARDS.NationPrivateShard;
exports.RegionShard			= SHARDS.RegionShard;
exports.WorldShard			= SHARDS.WorldShard;
exports.WAShard				= SHARDS.WAShard;


/* === Types === */
const {
	CardIndividualRequest,
	CardWorldRequest,
	Card,
	CardWorld
} = require('./requests/card');
const {
	Nation,
	NationRequest
} = require('./requests/nation');
const {
	Region,
	RegionRequest
} = require('./requests/region');
const {
	World,
	WorldRequest
} = require('./requests/world');
const {
	WorldAssembly,
	WARequest
} = require('./requests/wa');

exports.Card = Card;
exports.CardWorld = CardWorld;
exports.Nation = Nation;
exports.Region = Region;
exports.World = World;
exports.WorldAssembly = WorldAssembly;

/* 
 * For some reason, VS Code does not properly load these when require()'d in the API module, and
 * including them here seems to fix it...?
 * IDK why that happens, but until I figure out a proper solution, this should probably stay here. 
 */
const {
	IssueCommand,
	RMBPostCommand,
	DispatchAddCommand,
	DispatchDeleteCommand,
	DispatchEditCommand,
	GiftCardCommand
} = require('./requests/command');
const {
	TGRequest,
	UserAgentRequest,
	VersionRequest
} = require('./requests/misc');
const { Auction } = require('./typedefs/auction');
const { WABadge } = require('./typedefs/badge');
const { Banner } = require('./typedefs/banner');
const { ListCard } = require('./typedefs/card-list-item');
const { CensusDataNation } = require('./typedefs/census-data-nation');
const { CensusDataRegion } = require('./typedefs/census-data-region');
const { WCensusAverage } = require('./typedefs/census-data-world');
const { CensusRankScored } = require('./typedefs/census-rank-scored');
const { CensusRankUnscored } = require('./typedefs/census-rank-unscored');
const { ListCollection } = require('./typedefs/collection-list-item');
const { Collection } = require('./typedefs/collection');
const { DeathData } = require('./typedefs/death-data');
const { Deck } = require('./typedefs/deck');
const { ListDispatch } = require('./typedefs/dispatch-list-item');
const { Dispatch } = require('./typedefs/dispatch');
const { EmbassyData } = require('./typedefs/embassy-data');
const { ListFaction } = require('./typedefs/faction-list-item');
const { Faction } = require('./typedefs/faction');
const { FreedomsData } = require('./typedefs/freedoms-data');
const { FreedomsTextData } = require('./typedefs/freedoms-descriptions');
const { FreedomsScoreData } = require('./typedefs/freedoms-scores');
const { IDHappening } = require('./typedefs/happening-id');
const { Happening } = require('./typedefs/happening');
const { HDIData } = require('./typedefs/hdi-data');
const { IssueEffect } = require('./typedefs/issue-effect');
const { ListIssue } = require('./typedefs/issue-list-item');
const { Issue } = require('./typedefs/issue');
const { Market } = require('./typedefs/market');
const { NewNation } = require('./typedefs/newnation');
const { Notice } = require('./typedefs/notice');
const { Officer } = require('./typedefs/officer');
const { Policy } = require('./typedefs/policy');
const { Poll } = require('./typedefs/poll');
const { Proposal } = require('./typedefs/proposal');
const { Resolution } = require('./typedefs/resolution');
const { RMBActivityAggregate } = require('./typedefs/rmb-aggregate');
const { RMBPost } = require('./typedefs/rmb-post');
const { SectorsData } = require('./typedefs/sectors-data');
const { SpendingData } = require('./typedefs/spending-data');
const { TGQueue } = require('./typedefs/tg-queue');
const { TradeCardbound } = require('./typedefs/trade-cardbound');
const { Trade } = require('./typedefs/trade');
const { UnreadsData } = require('./typedefs/unreads-data');
const { VoteTally } = require('./typedefs/vote-tally');
const { ZombieDataNation } = require('./typedefs/zombie-data-nation');
const { ZombieDataRegion } = require('./typedefs/zombie-data-region');
