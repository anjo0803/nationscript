/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	ShardableRequest,
	toIDForm
} = require('./base');
const { RegionShard } = require('../shards');
const {
	CensusMode,
	CensusScale
} = require('../enums');

const Region = require('../type/region');

/**
 * Request subclass for building requests to the regions endpoint of the API.
 */
class RegionRequest extends ShardableRequest {
	/**
	 * @arg {string} region Name of the region to request data on
	 */
	constructor(region) {
		super();
		this.mandate('region')
			.setArgument('region', toIDForm(region));
	}

	/**
	 * Define one or more {@link CensusScale}s to query. Affects requests
	 * containing the {@link RegionShard.CENSUS} shard. If this is not set, the
	 * API uses the day's featured scale.
	 * 
	 * *Note that the NS API uses the same argument name for the custom scales
	 * here and for queries of the {@link RegionShard.CENSUS_RANKS} shard, and
	 * setting them here will thus override any custom scales previously set
	 * via {@link RegionRequest#setCensusLeaderboardOptions} in this request
	 * instance.*
	 * @arg {...number} scales IDs of the census scales to request; `null` to
	 *     request all
	 * @returns {this} The request, for chaining
	 */
	setCensusScales(...scales) {
		if(scales) return this.setArgument('scale', ...scales);
		return this.setArgument('scale', 'all');
	}

	/**
	 * Set one or more {@link CensusMode}s to request the World Census scale
	 * data in. Only affects requests containing the {@link RegionShard.CENSUS}
	 * shard. If custom modes are not requested, the API uses
	 * {@link CensusMode.SCORE} and {@link CensusMode.RANK_WORLD}.
	 * @arg  {...string} modes Mode(s) to use. {@link CensusMode.RANK_REGION}
	 *     and {@link CensusMode.RANK_REGION_PERCENT} are ignored by the API in
	 *     requests for region data
	 * @returns {this} The request, for chaining
	 */
	setCensusMode(...modes) {
		return this.setArgument('mode', ...modes);
	}

	/**
	 * Define a custom {@link CensusScale} and rank to start compiling from.
	 * Affects queries of the {@link RegionShard.CENSUS_RANKS} shard. If this
	 * is not set, API uses the day's featured scale, and starts from rank 1.
	 * 
	 * *Note that the NS API uses the same argument name for the custom scale
	 * both here and for queries of the {@link RegionShard.CENSUS} shard, and
	 * setting it here will thus override any custom scales previously set via
	 * {@link RegionRequest#setCensusScales} in this request instance.*
	 * @param {?number} scale ID of the desired World Census scale; `null` to
	 *     use the day's featured scale
	 * @param {?number} offset Rank from which to start (inclusive); `null` to
	 *     start from rank 1
	 * @returns {this} The request, for chaining
	 */
	setCensusLeaderboardOptions(scale, offset = 1) {
		return this
			.setArgument('scale', scale)
			.setArgument('start', offset);
	}

	/**
	 * Define criteria by which to query RMB posts. Affects the
	 * {@link RegionShard.RMB_MESSAGES} shard. If this is not set, the API
	 * returns the 10 most recent posts.
	 * 
	 * *Note that the NS API uses the same argument name for the message limit
	 * here and the nation limit for queries of the
	 * {@link RegionShard.RMB_MOST_POSTS}, {@link RegionShard.RMB_MOST_LIKES},
	 * or {@link RegionShard.RMB_MOST_LIKED} shards, and setting it here will
	 * thus override a limit previously set via
	 * {@link RegionRequest#setRMBLeaderboardOptions} in this request
	 * instance.*
	 * @param {?number} limit Maximum number of messages to return; values
	 *     below `1` and above `100` are ignored by the API
	 * @param {number} offset How many posts to shift the result list backwards
	 * @param {number} start Post ID from which on to consider messages
	 * @returns {this} The request, for chaining
	 */
	setRMBHistoryOptions(limit, offset, start) {
		return this
			.setArgument('limit', limit)
			.setArgument('offset', offset)
			.setArgument('fromid', start);
	}

	/**
	 * Define a time period for which to consider nations' aggregate RMB
	 * activity and a maximum number of nations to rank. Affects requests
	 * containing the {@link RegionShard.RMB_MOST_POSTS},
	 * {@link RegionShard.RMB_MOST_LIKES}, or
	 * {@link RegionShard.RMB_MOST_LIKED} shards. If this is not set, the API
	 * returns *all* nations with a score from the dawn of time up to now.
	 * 
	 * *Note that the NS API uses the same argument name for the nation limit
	 * here and the message limit for queries of the
	 * {@link RegionShard.RMB_MESSAGES} shard, and setting it here will thus
	 * override a limit previously set via
	 * {@link RegionRequest#setRMBHistoryOptions} in this request instance.*
	 * @param {?number} limit Maximum number of nations to return; `null` to
	 *     return all that have a score
	 * @param {?number} from Timestamp from which on to consider RMB activity;
	 *     `null` to start from the earliest available
	 * @param {?number} to Timestamp up to which to consider RMB activity;
	 *     `null` to use all up to now
	 * @returns {this} The request, for chaining
	 */
	setRMBLeaderboardOptions(limit, from, to) {
		return this
			.setArgument('limit', limit)
			.setArgument('from', from)
			.setArgument('to', to);
	}

	/**
	 * @inheritdoc
	 * @returns {Promise<Region.Region>}
	 */
	async send() {
		this.useFactory(Region.create);
		return await super.send();
	}
}

exports.RegionRequest = RegionRequest;
