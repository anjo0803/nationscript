/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { CensusScale } = require('../enums');
const { NationShard } = require('../shards');
const { attr } = require('../requests/converter');

/**
 * Container object holding data on a nation's rank on the day's featured World Census scale,
 * without the raw score, as returned by the {@linkcode NationShard.CENSUS_RANK} and
 * {@linkcode NationShard.CENSUS_RANK_REGION} shards.
 * @typedef {object} CensusRankUnscored
 * @prop {number} scale ID of the {@linkcode CensusScale} the rank is for.
 * @prop {number} rank The rank of the nation.
 */
/**
 * Builds a rank object from the provided parsed response XML.
 * @param {object} scale The root object - a `<WCENSUS>` or `<RCENSUS>` tag in the parsed XML object.
 * @returns {CensusRankUnscored} The built rank object.
 * @ignore
 */
exports.parseCensusRankUnscored = (scale) => {
	return {
		scale:	parseInt(attr(scale, 'ID')),
		rank:	parseInt(scale['$text'])
	};
}
