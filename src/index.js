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

const reqBase = require('./requests/base');
exports.NSCredential = reqBase.NSCredential;

const dump = require('./requests/dump');
exports.DumpMode = dump.DumpMode;

/* === Enums === */
const enums = require('./enums');
exports.Admirable = enums.Admirable;
exports.CardBadgeType = enums.CardBadgeType;
exports.CensusMode = enums.CensusMode;
exports.CensusScale = enums.CensusScale;
exports.CrosspostingPolicy = enums.CrosspostingPolicy;
exports.DeathCause = enums.DeathCause;
exports.DispatchCategory = enums.DispatchCategory;
exports.DispatchSubcategory = enums.DispatchSubcategory;
exports.DispatchSearchMode = enums.DispatchSearchMode;
exports.EmbassyPhase = enums.EmbassyPhase;
exports.HappeningsFilter = enums.HappeningsFilter;
exports.Influence = enums.Influence;
exports.LegalityRuling = enums.LegalityRuling;
exports.NationCategory = enums.NationCategory;
exports.Notable = enums.Notable;
exports.NoticeIcon = enums.NoticeIcon;
exports.NoticeType = enums.NoticeType;
exports.OfficerAuthority = enums.OfficerAuthority;
exports.Rarity = enums.Rarity;
exports.ReclassificationCategory = enums.ReclassificationCategory;
exports.RMBPostStatus = enums.RMBPostStatus;
exports.Sensibility = enums.Sensibility;
exports.Tag = enums.Tag;
exports.WABadgeType = enums.WABadgeType;
exports.WACouncil = enums.WACouncil;
exports.WAStatus = enums.WAStatus;
exports.WAVote = enums.WAVote;
exports.ZombieAction = enums.ZombieAction;

/* === Shards === */
const shards = require('./shards');
exports.CardDetailShard = shards.CardDetailShard;
exports.CardShard = shards.CardShard;
exports.NationShard = shards.NationShard;
exports.NationPrivateShard = shards.NationPrivateShard;
exports.RegionShard = shards.RegionShard;
exports.WAShard = shards.WAShard;
exports.WorldShard = shards.WorldShard;

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
const reqCard = require('./requests/card');
const reqCommand = require('./requests/command');
const reqMisc = require('./requests/misc');
const reqNation = require('./requests/nation');
const reqRegion = require('./requests/region');
const reqWA = require('./requests/wa');
const reqWorld = require('./requests/world');
const factory = require('./factory');
const error = require('./errors');
