/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	ShardableRequest,
	toIDForm,
	listToIDForm
} = require('./base');
const { WorldShard } = require('../shards');
const {
	CensusScale,
	DispatchCategory,
	DispatchSubcategory,
	DispatchSearchMode,
	HappeningsFilter,
	Tag
} = require('../enums');

const World = require('../type/world');

/**
 * Request subclass for building requests to the world endpoint of the API.
 */
class WorldRequest extends ShardableRequest {

	/**
	 * Define one or more {@link CensusScale}s to query. Affects requests
	 * containing the {@link WorldShard.CENSUS},
	 * {@link WorldShard.CENSUS_DESCRIPTION}, {@link WorldShard.CENSUS_NAME},
	 * {@link WorldShard.CENSUS_RANKS}, and {@link WorldShard.CENSUS_TITLE}
	 * shards. If this is not set, the API uses the day's featured scale.
	 * 
	 * *Only the `CENSUS` shard displays results for more than one scale. The
	 * others will only return data for the first one specified.*
	 * @arg {...number} scales IDs of the census scales to request; `null` to
	 *     request all
	 * @returns {this} The request, for chaining
	 */
	setCensusScales(...scales) {
		if(scales) return this.setArgument('scale', ...scales);
		return this.setArgument('scale', 'all');
	}

	/**
	 * Define a custom {@link CensusScale} and rank to start compiling from.
	 * Affects queries of the {@link WorldShard.CENSUS_RANKS} shard. If this is
	 * not set, API uses the day's featured scale, and starts from rank 1.
	 * 
	 * *Note that the NS API uses the same argument name for the custom scale
	 * both here and for queries of all shards listed for the
	 * {@link WorldRequest#setCensusScales} function, and setting it here will
	 * thus override any previously set via it in this request instance.*
	 * @arg {?number} scale ID of the desired World Census scale; `null` to use
	 *     the day's featured scale
	 * @arg {?number} offset Rank from which to start (inclusive); `null` to
	 *     start from rank 1
	 * @returns {this} The request, for chaining
	 */
	setCensusLeaderboardOptions(scale, offset = 1) {
		return this
			.setArgument('scale', scale)
			.setArgument('start', offset);
	}

	/**
	 * Define the banners to be queried. Only affects requests containing the
	 * {@link WorldShard.BANNER} shard.
	 * @arg  {...string} banners IDs of the desired banners
	 * @returns {this} The request, for chaining
	 */
	setBannerQuery(...banners) {
		// The API wants separation by ',' here
		return this.setArgument('banner', banners?.join(','));
	}

	/**
	 * Set the ID of the dispatch to be queried. Only affects requests
	 * containing the {@link WorldShard.DISPATCH} shard.
	 * @arg {number} id ID of the desired dispatch
	 * @returns {this} The request, for chaining
	 */
	setDispatch(id) {
		return this.setArgument('dispatchid', id);
	}

	/**
	 * Define custom criteria by which to query dispatches. Only affects
	 * requests containing the {@link WorldShard.DISPATCH_LIST} shard.
	 * @arg {?string} author Name of the nation to exclusively query the
	 *     dispatches of; `null` to not query by authorship
	 * @arg {?string} category {@link DispatchCategory} to query; `null` to
	 *     query all categories
	 * @arg {?string} subcategory {@link DispatchSubcategory} to query from
	 *     within the `category`; `null` to query all subcategories
	 * @arg {?string} searchMode {@link DispatchSearchMode} to apply
	 * @returns {this} The request, for chaining
	 */
	setDispatchSearchOptions(author, category, subcategory, searchMode) {
		return this
			.setArgument('dispatchauthor', author && toIDForm(author))
			.setArgument('dispatchcategory',
				category && subcategory ? `${category}:${subcategory}`
					: category)	// subcategory is not valid on its own!
			.setArgument('dispatchsort', searchMode);
	}

	/**
	 * Specify tags to query regions by. Only affects requests containing the
	 * {@link WorldShard.REGIONS_BY_TAG} shard.
	 * @arg  {...string} tags {@link Tag}s that regions must (not) have in
	 *     order to be returned; use `Tag.NOT + [tag]` to disallow a tag
	 * @returns {this} The request, for chaining
	 */
	setRegionSearchTags(...tags) {
		// The API wants separation by ',' here
		return this.setArgument('tags', tags?.join(','));
	}

	/**
	 * Set the ID of the poll to query. Only affects requests containing the
	 * {@link WorldShard.POLL} shard.
	 * @arg {number} id ID of the desired poll
	 * @returns {this} The request, for chaining
	 */
	setPoll(id) {
		return this.setArgument('pollid', id);
	}

	/**
	 * Limit the list of happening events to be queried to those occurring
	 * after and before the happening events with the specified IDs. Only
	 * affects requests containing the {@linkcode WorldShard.HAPPENINGS} shard.
	 * @arg {?number} start ID of the happening event from which on to return
	 *     happening events; `null` to not demand a minimum ID
	 * @arg {?number} end ID of the happening event up to which to return
	 *     happening events; `null` to not demand a maximum ID
	 * @returns {this} The request, for chaining
	 */
	setHappeningsWindowID(start, end) {
		return this
			.setArgument('sinceid', start)
			.setArgument('beforeid', end);
	}

	/**
	 * Limit the list of happening events to be queried to those occurring
	 * after and before the given timestamps. Only affects requests containing
	 * the {@linkcode WorldShard.HAPPENINGS} shard.
	 * @arg {?number} start Timestamp from which on to return happening events;
	 *     `null` to start from the earliest available
	 * @arg {?number} end Timestamp up to which to return happening events;
	 *     `null` to end with the most recent available
	 * @returns {this} The request, for chaining
	 */
	setHappeningsWindowTime(start, end) {
		return this
			.setArgument('sincetime', start)
			.setArgument('beforetime', end);
	}

	/**
	 * Limit the list of happening events to be queried to those matching one
	 * of the given filters. Only affects requests containing the
	 * {@linkcode WorldShard.HAPPENINGS} shard.
	 * @arg  {...string} filters {@link HappeningsFilter}s to apply
	 * @returns {this} The request, for chaining
	 */
	setHappeningsFilters(...filters) {
		return this.setArgument('filter', ...filters);
	}

	/**
	 * Set a limit for how many happening events may be returned. Only affects
	 * requests containing the {@link WorldShard.HAPPENINGS} shard.
	 * @arg {number} limit Maximum number of happenings to return. Values below
	 *     `1` and `200` are ignored by the API
	 * @returns {this} The request, for chaining
	 */
	setHappeningsLimit(limit) {
		return this.setArgument('limit', limit);
	}

	/**
	 * Specify one or more nations from which alone to query happening events.
	 * Only affects requests containing the {@link WorldShard.HAPPENINGS}
	 * shard. Targets set via {@link WorldRequest#setHappeningsRegions} will be
	 * overwritten!
	 * @arg {...string} nations Name(s) of the desired nations.
	 * @returns {this} The request, for chaining.
	 */
	setHappeningsNations(...nations) {
		return this.setArgument('view',
			`nation.${listToIDForm(nations)?.join(',')}`);
	}

	/**
	 * Specify one or more regions from which alone to query happening events.
	 * Only affects requests containing the {@link WorldShard.HAPPENINGS}
	 * shard. Targets set via {@link WorldRequest#setHappeningsNations} will be
	 * overwritten!
	 * @arg {...string} regions Name(s) of the desired regions.
	 * @returns {this} The request, for chaining.
	 */
	setHappeningsRegions(...regions) {
		return this.setArgument('view',
			`region.${listToIDForm(regions)?.join(',')}`);
	}

	/**
	 * Specify the ID of the N-Day faction to request details on. Only affects
	 * requests containing the {@linkcode WorldShard.FACTION} shard.
	 * @arg {number} fid ID of the desired faction.
	 * @returns {this} The request, for chaining.
	 */
	setFactionID(fid) {
		return this.setArgument('id', fid);
	}

	/**
	 * @inheritdoc
	 * @returns {Promise<World.World>}
	 */
	async send() {
		this.useFactory(World.create);
		return await super.send();
	}
}

exports.WorldRequest = WorldRequest;
