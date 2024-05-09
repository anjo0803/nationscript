/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Internal module providing request builder classes specialised for fetching
 * data from the Cards API.
 * @module nationscript/requests/card
 */

const {
	DataRequest,
	ShardableRequest,
	toIDForm
} = require('./base');
const {
	CardShard,
	CardDetailShard
} = require('../shards');
const types = require('../types');

const Card = require('../type/card');
const CardWorld = require('../type/card-world');

/**
 * Request subclass for building requests to the (individual) cards endpoint of
 * the API (`q=card`).
 */
class CardIndividualRequest extends ShardableRequest {
	/**
	 * Additionally {@link DataRequest#mandate mandate}s the `q`, `cardid`, and
	 * `season` arguments and sets the `q` argument.
	 */
	constructor() {
		super();
		this.mandate('q', 'cardid', 'season')
			.setArgument('q', 'card');
	}

	/**
	 * Define the card to query with this request.
	 * @param {number} id ID of the card to request
	 * @param {number} season Season the desired card was inscribed for
	 * @returns {this} The request, for chaining
	 */
	setCard(id, season) {
		return this
			.setArgument('cardid', id)
			.setArgument('season', season);
	}

	/**
	 * Define a time frame from which alone to return trades of the queried
	 * card as well as a maximum number of trades to return. Only affects
	 * requests containing the {@link CardDetailShard.TRADES} shard.
	 * @arg {number} limit Maximum number of trades to return. If not set, 50
	 *     trades are returned.
	 * @arg {number} from Timestamp from which on to return trades
	 * @arg {number} to Timestamp up to which to return trades
	 * @returns {this} The request, for chaining
	 */
	setTradesOptions(limit, from, to) {
		return this
			.setArgument('limit', limit)
			.setArgument('sincetime', from)
			.setArgument('beforetime', to);
	}

	/**
	 * @inheritdoc
	 * @returns {Promise<types.Card>}
	 */
	async send() {
		this.useFactory(Card.create);
		return await super.send();
	}

	/*
	 * The cards API works slightly differently than the others request-side,
	 * since it doesn't have a `nation=name`, `wa=number`, or a similar URL
	 * parameter that would distinguish it from the world API, and instead uses
	 * `q=card[s]` for this - but this wouldn't work with some of the
	 * ShardableRequest functions, which might overwrite or remove this single
	 * difference, so those need to be overridden here.
	 */

	/** @inheritdoc */
	shard(...shards) {
		return super.shard('card', ...shards);
	}

	/** @inheritdoc */
	clearShards() {
		return super.clearShards().shard('card');
	}

	/** @inheritdoc */
	removeShards(...shards) {
		let i = shards.indexOf('card');
		if(i >= 0) shards.splice(i, 1);
		return super.removeShards(...shards);
	}
}

/**
 * Request subclass for building requests to the (world) cards endpoint of the
 * API (`q=cards`).
 */
class CardWorldRequest extends ShardableRequest {
	/**
	 * Additionally {@link DataRequest#mandate mandate}s the `q` argument and
	 * sets it.
	 */
	constructor() {
		super();
		this.mandate('q')
			.setArgument('q', 'card');
	}

	/**
	 * Set the ID of the card collection to query the details of. Only affects
	 * requests containing the {@link CardShard.COLLECTION_DETAILS} shard.
	 * @arg {number} id ID of the collection to view
	 * @returns {this} The request, for chaining
	 */
	setCollectionID(id) {
		return this.setArgument('collectionid', id);
	}

	/**
	 * Set the nation to query card data for by its ID. Only affects requests
	 * containing the {@link CardShard.CARDS}, {@link CardShard.SUMMARY},
	 * {@link CardShard.ASKS_BIDS}, or {@link CardShard.COLLECTIONS} shards.
	 * @arg {number} id Database ID of the desired nation
	 * @returns {this} The request, for chaining
	 */
	setNationID(id) {
		return this.setArgument('nationid', id);
	}

	/**
	 * Set the nation to query card data for by its name. Only affects requests
	 * containing the {@link CardShard.CARDS}, {@link CardShard.SUMMARY},
	 * {@link CardShard.ASKS_BIDS}, or {@link CardShard.COLLECTIONS} shards.
	 * @arg {string} name Name of the desired nation
	 * @returns {this} The request, for chaining
	 */
	setNationName(name) {
		return this.setArgument('nationname', toIDForm(name));
	}

	/**
	 * Define a time frame from which alone to return trades as well as a
	 * maximum number of trades to return. Only affects requests containing the
	 * {@link CardShard.TRADES} shard.
	 * @arg {number} limit Maximum number of trades to return. If not set, 50
	 *     trades are returned.
	 * @arg {number} from Timestamp from which on to return trades.
	 * @arg {number} to Timestamp up to which to return trades.
	 * @returns {this} The request, for chaining
	 */
	setTradesOptions(limit, from, to) {
		return this
			.setArgument('limit', limit)
			.setArgument('sincetime', from)
			.setArgument('beforetime', to);
	}

	/**
	 * @inheritdoc
	 * @returns {Promise<types.CardWorld>}
	 */
	async send() {
		this.useFactory(CardWorld.create);
		return await super.send();
	}


	/* See above. */

	/** @inheritdoc */
	shard(...shards) {
		return super.shard('cards', ...shards);
	}

	/** @inheritdoc */
	clearShards() {
		return super.clearShards().shard('cards');
	}

	/** @inheritdoc */
	removeShards(...shards) {
		let i = shards.indexOf('cards');
		if(i >= 0) shards.splice(i, 1);
		return super.removeShards(...shards);
	}
}

exports.CardWorldRequest = CardWorldRequest;
exports.CardIndividualRequest = CardIndividualRequest;
