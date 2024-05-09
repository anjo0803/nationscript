/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Main module of NationScript
 * @module nationscript
 */

const NS = require('./api');
exports.NS = NS;

const { NSCredential } = require('./requests/base');
exports.NSCredential = NSCredential;

const { DumpMode } = require('./requests/dump');
exports.DumpMode = DumpMode;

/* === Enums === */
const {
	Admirable,
	CardBadgeType,
	CensusMode,
	CensusScale,
	CrosspostingPolicy,
	DeathCause,
	DispatchCategory,
	DispatchSubcategory,
	DispatchSearchMode,
	EmbassyPhase,
	HappeningsFilter,
	Influence,
	LegalityRuling,
	NationCategory,
	Notable,
	NoticeIcon,
	NoticeType,
	OfficerAuthority,
	Rarity,
	ReclassificationCategory,
	RMBPostStatus,
	Sensibility,
	Tag,
	WABadgeType,
	WACouncil,
	WAStatus,
	WAVote,
	ZombieAction
} = require('./enums');
exports.Admirable = Admirable;
exports.CardBadgeType = CardBadgeType;
exports.CensusMode = CensusMode;
exports.CensusScale = CensusScale;
exports.CrosspostingPolicy = CrosspostingPolicy;
exports.DeathCause = DeathCause;
exports.DispatchCategory = DispatchCategory;
exports.DispatchSubcategory = DispatchSubcategory;
exports.DispatchSearchMode = DispatchSearchMode;
exports.EmbassyPhase = EmbassyPhase;
exports.HappeningsFilter = HappeningsFilter;
exports.Influence = Influence;
exports.LegalityRuling = LegalityRuling;
exports.NationCategory = NationCategory;
exports.Notable = Notable;
exports.NoticeIcon = NoticeIcon;
exports.NoticeType = NoticeType;
exports.OfficerAuthority = OfficerAuthority;
exports.Rarity = Rarity;
exports.ReclassificationCategory = ReclassificationCategory;
exports.RMBPostStatus = RMBPostStatus;
exports.Sensibility = Sensibility;
exports.Tag = Tag;
exports.WABadgeType = WABadgeType;
exports.WACouncil = WACouncil;
exports.WAStatus = WAStatus;
exports.WAVote = WAVote;
exports.ZombieAction = ZombieAction;

/* === Shards === */
const {
	CardDetailShard,
	CardShard,
	NationShard,
	NationPrivateShard,
	RegionShard,
	WAShard,
	WorldShard
} = require('./shards');
exports.CardDetailShard = CardDetailShard;
exports.CardShard = CardShard;
exports.NationShard = NationShard;
exports.NationPrivateShard = NationPrivateShard;
exports.RegionShard = RegionShard;
exports.WAShard = WAShard;
exports.WorldShard = WorldShard;

/* === Types === */
const types = require('./types');

/**
 * Helper object opening up an easy possibility to reference the NationScript
 * types.
 */
exports.types = types;


/* 
 * === IntelliSense Work-Around ==

 * The VSCode IntelliSense does not actually seem to recognise JSDocs on the
 * "lower" levels of the package - the furthest it looks to be able to see is
 * a single level down from files loaded in the index file.
 * 
 * One solution would be to use the TS compiler to generate .d.ts files for all
 * the NationScript files. IntelliSense works fine in that case. However, for
 * some reason, the TS compiler decides to ditch JSDocs attached to properties
 * of exported object literals (i.e. all the enums), which renders them
 * virtually useless, and I have not found a way to fix this without breaking
 * the result of the (external) documentation generation by JSDoc.
 * 
 * The other option would be the `tsd-jsdoc` package. That one does not seem to
 * be able to resolve the re-export of types and classes, like here with the NS
 * object - it just resolves it to be `any` type, which is the opposite of what
 * the documentation is for.
 * 
 * Alas, I'm left with little options but to simply import *everything* here,
 * so that the IntelliSense picks it up. It's not pretty, but the only way I've
 * been able to identify that preserves both JSDoc documentation generation and
 * IntelliSense functionality.
 */
const {
	NSRequest,
	DataRequest,
	ShardableRequest
} = require('./requests/base');
const {
	CardIndividualRequest,
	CardWorldRequest
} = require('./requests/card');
const {
	DispatchAddCommand,
	DispatchDeleteCommand,
	DispatchEditCommand,
	GiftCardCommand,
	IssueCommand,
	RMBPostCommand
} = require('./requests/command');
const {
	CardDumpRequest,
	DumpRequest,
	NationDumpRequest,
	RegionDumpRequest
} = require('./requests/dump');
const {
	TGRequest,
	UserAgentRequest,
	VersionRequest
} = require('./requests/misc');
const { NationRequest } = require('./requests/nation');
const { RegionRequest } = require('./requests/region');
const { WARequest } = require('./requests/wa');
const { WorldRequest } = require('./requests/world');
