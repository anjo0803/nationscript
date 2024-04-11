/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	RegionShard,
	WorldShard
} = require('../shards');
const {
	num,
	txt
} = require('../requests/converter');

/**
 * Container object for a nation's rank on a given World Census scale, including the raw score, as
 * returned by the {@linkcode RegionShard.CENSUS_RANKS} and {@linkcode WorldShard.CENSUS_RANKS}
 * shards.
 * @typedef {object} CensusRankScored
 * @prop {string} nation Name of the nation.
 * @prop {number} rank Rank of the nation on the scale.
 * @prop {number} score Score of the nation on the scale.
 */
/**
 * Builds a scored rank object from the provided parsed response XML.
 * @param {object} nation The root object - a `<NATION>` tag in the parsed XML object.
 * @returns {CensusRankScored} The built scored rank object.
 * @ignore
 */
exports.parseCensusRank = (nation) => {
	return {
		nation:	txt(nation, 'NAME'),
		rank:	num(nation, 'RANK'),
		score:	num(nation, 'SCORE')
	};
}
