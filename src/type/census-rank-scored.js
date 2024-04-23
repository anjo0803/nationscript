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
	NSFactory,
	convertNumber
} = require('../factory');

/**
 * Container object for a nation's rank on a given World Census scale,
 * including the raw score, as returned by the
 * {@linkcode RegionShard.CENSUS_RANKS} and
 * {@linkcode WorldShard.CENSUS_RANKS} shards.
 * @typedef {object} CensusRankScored
 * @prop {string} nation Name of the nation (`id_form`).
 * @prop {number} rank Rank of the nation on the scale.
 * @prop {number} score Score of the nation on the scale.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<CensusRankScored>} A new `CensusRankScored` factory
 */
exports.create = root => new NSFactory()
	.onTag('NAME', me => me
		.build('nation'))
	.onTag('RANK', me => me
		.build('rank', convertNumber))
	.onTag('SCORE', me => me
		.build('score', convertNumber));
