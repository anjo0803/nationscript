/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { CensusScale } = require('../enums');
const { NationShard } = require('../shards');
const {
	NSFactory,
	convertNumber
} = require('../factory');

/**
 * Container object holding data on a nation's rank on the day's featured World
 * Census scale, without the raw score, as returned by the
 * {@linkcode NationShard.CENSUS_RANK} and
 * {@linkcode NationShard.CENSUS_RANK_REGION} shards.
 * @typedef {object} CensusRankUnscored
 * @prop {number} scale ID of the {@linkcode CensusScale} the rank is for.
 * @prop {number} rank The rank of the nation.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<CensusRankUnscored>} A new `CensusRankUnscored` factory
 */
exports.create = root => new NSFactory()
	.set('scale', root['id'], convertNumber)
	.build('rank', convertNumber);
