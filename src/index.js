/**
 * @file Index file to collect all exports intended for direct usage by the user.
 * @author anjo/Tepertopia
 * @version 1.0.1
 * @license {@linkplain https://mozilla.org/MPL/2.0/ MPL-2.0}
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
exports.HappeningsFilter = ENUMS.HappeningsFilter;
exports.Influence = ENUMS.Influence;
exports.Notable = ENUMS.Notable;
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
