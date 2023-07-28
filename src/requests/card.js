/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { Rarity } = require('../enums');
const { ShardableRequest } = require('./base');
const {
	CardShard,
	CardDetailShard
} = require('../shards');

const {
	arr,
	num,
	txt,

	handle,
	handleList
} = require('./converter');

const { Auction, parseAuction }						= require('../typedefs/auction');
const { Collection, parseCollection }				= require('../typedefs/collection');
const { ListCollection, parseCollectionOverview }	= require('../typedefs/collection-list-item');
const { ListCard, parseCardItem }					= require('../typedefs/card-list-item');
const { Deck, parseDeckSummary }					= require('../typedefs/deck');
const { Market, parseMarket }						= require('../typedefs/market');
const { Trade, parseTrade }							= require('../typedefs/trade');
const { TradeCardbound, parseTradeCardbound }		= require('../typedefs/trade-cardbound');

/**
 * Request subclass for building requests to the (individual) cards endpoint of the API (`q=card`).
 */
class CardIndividualRequest extends ShardableRequest {
	constructor(id, season) {
		super('q', 'cardid', 'season');
		this.shard('card')
			.setArgument('cardid', id)
			.setArgument('season', season);
	}

	/**
	 * Defines a custom time frame from which to return trades of the card and a maximum number of
	 * them to return for queries of the {@linkcode CardDetailShard.TRADES} shard.
	 * @param {number} limit Maximum number of trades to return. The default is `50`.
	 * @param {number} from Unix epoch timestamp from which on to return trades.
	 * @param {number} to Unix epoch timestamp up to which to return trades.
	 * @returns {this} The request, for chaining.
	 */
	setTradesOptions(limit, from, to) {
		return this
			.setArgument('limit', limit)
			.setArgument('sincetime', from)
			.setArgument('beforetime', to);
	}

	/**
	 * Sends an HTTP request with all data specified in this request
	 * instance to the API and parses its response.
	 * @returns {Promise<Card>} A card object holding all data returned.
	 */
	async send() {
		return new exports.Card(await super.send('CARD'));
	}

	/*
	 * The cards API works slightly differently than the others request-side, since it doesn't
	 * have a `nation=name`, `wa=number`, or a similar URL parameter that would distinguish it
	 * from the world API, and instead uses `q=card[s]` for this - but this wouldn't work with
	 * some of the ShardableRequest functions, which might overwrite or remove this single
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
		let remain = ['card'];
		for(let shard of this.getShards()) if(!shards.includes(shard)) remain.push(shard);
		return this.shard(...remain);
	}
}

/**
 * Request subclass for building requests to the (world) cards endpoint of the API (`q=cards`).
 */
class CardWorldRequest extends ShardableRequest {
	constructor() {
		super('q');
	}

	/**
	 * Sets the ID of the card collection to query the details of with the
	 * {@linkcode CardShard.COLLECTION_DETAILS} shard.
	 * @param {number} id ID of the collection to view.
	 * @returns {this} The request, for chaining.
	 */
	setCollectionID(id) {
		return this.setArgument('collectionid', id);
	}

	/**
	 * Defines the nation to query the deck summary and content, asks and bids, and list of
	 * collections of with the {@linkcode CardShard.CARDS}, {@linkcode CardShard.SUMMARY},
	 * {@linkcode CardShard.ASKS_BIDS}, and {@linkcode CardShard.COLLECTIONS} shards by its
	 * database ID.
	 * @param {number} id Database ID of the desired nation.
	 * @returns {this} The request, for chaining.
	 */
	setNationID(id) {
		return this.setArgument('nationid', id);
	}

	/**
	 * Defines the nation to query the deck summary and content, asks and bids, and list of
	 * collections of with the {@linkcode CardShard.CARDS}, {@linkcode CardShard.SUMMARY},
	 * {@linkcode CardShard.ASKS_BIDS}, and {@linkcode CardShard.COLLECTIONS} shards by its
	 * name.
	 * @param {number} id Database ID of the desired nation.
	 * @returns {this} The request, for chaining.
	 */
	setNationName(name) {
		return this.setArgument('nationname', name);
	}

	/**
	 * Defines a custom time frame from which to return trades of the card and a maximum number of
	 * them to return for queries of the {@linkcode CardShard.TRADES} shard.
	 * @param {number} limit Maximum number of trades to return. The default is `50`.
	 * @param {number} from Unix epoch timestamp from which on to return trades.
	 * @param {number} to Unix epoch timestamp up to which to return trades.
	 * @returns {this} The request, for chaining.
	 */
	setTradesOptions(limit, from, to) {
		return this
			.setArgument('limit', limit)
			.setArgument('sincetime', from)
			.setArgument('beforetime', to);
	}

	/**
	 * Sends an HTTP request with all data specified in this request
	 * instance to the API and parses its response.
	 * @returns {Promise<Card[]>} An list of card objects representing those in the nation's deck.
	 */
	async send() {
		return new exports.CardWorld(await super.send('CARDS'));
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
		let remain = ['cards'];
		for(let shard of this.getShards()) if(!shards.includes(shard)) remain.push(shard);
		return this.shard(...remain);
	}
}

/**
 * Represents a trading card in the NationStates multiverse. Only stores the data returned
 * by the API, without implementing any additional functions to do stuff with it.
 */
class Card {
	constructor(parsed) {
		if(parsed['$name'] !== 'CARD') throw new Error('Invalid XML root');
		for(let tag in parsed) switch(tag) {

			/* === Primitive Properties === */

			case 'CARDID':
				/**
				 * ID of the card; corresponds to the database ID of the nation it depicts.
				 * @type number
				 */
				this.id = num(parsed, tag);
				break;

			case 'CATEGORY':
				/**
				 * The card's {@linkcode Rarity}.
				 * @type string
				 */
				this.rarity = txt(parsed, tag);
				break;

			case 'FLAG':
				/**
				 * URL of the flag image of the nation depicted on the card.
				 * @type string
				 * @see {@linkcode CardDetailShard.INFO}
				 */
				this.flag = txt(parsed, tag);
				break;

			case 'GOVT':
				/**
				 * World Census classification of the nation depicted on the card.
				 * @type string
				 * @see {@linkcode CardDetailShard.INFO}
				 */
				this.type = txt(parsed, tag);
				break;

			case 'MARKET_VALUE':
				/**
				 * Calculated market value of the card.
				 * @type number
				 */
				this.value = num(parsed, tag);
				break;

			case 'NAME':
				/**
				 * Name of the nation depicted on the card.
				 * Authentically capitalised.
				 * @type string
				 * @see {@linkcode CardDetailShard.INFO}
				 */
				this.name = txt(parsed, tag);
				break;

			case 'OWNERS':
				/**
				 * List with the names of all nations owning a copy of the card. Nations owning
				 * multiple copies are listed a corresponding number of times consecutively.
				 * @type string[]
				 * @see {@linkcode CardDetailShard.OWNERS}
				 */
				this.owners = arr(parsed, tag);
				break;

			case 'REGION':
				/**
				 * Name of the region the nation depicted on the card resided in.
				 * Authentically capitalised.
				 * @type string
				 * @see {@linkcode CardDetailShard.INFO}
				 */
				this.region = txt(parsed, tag);
				break;

			case 'SEASON':
				/**
				 * ID of the season the card was inscribed for.
				 * @type number
				 */
				this.season = num(parsed, tag);
				break;

			case 'SLOGAN':
				/**
				 * National motto of the nation depicted on the card.
				 * @type string
				 * @see {@linkcode CardDetailShard.INFO}
				 */
				this.motto = txt(parsed, tag);
				break;

			case 'TYPE':
				/**
				 * Pretitle of the nation depicted on the card.
				 * @type string
				 * @see {@linkcode CardDetailShard.INFO}
				 */
				this.pretitle = txt(parsed, tag);
				break;


			/* === Complex Properties === */

			case 'MARKETS':
				/**
				 * List of all asks and bids ("markets") currently active for the card.
				 * @type Market[]
				 * @see {@linkcode CardDetailShard.MARKETS}
				 */
				this.asksBids = handleList(parsed[tag][0], parseMarket);
				break;

			case 'TRADES':
				/**
				 * List of the transfers of the card that matched the query filter.
				 * @type TradeCardbound[]
				 * @see {@linkcode CardDetailShard.TRADES}
				 */
				this.trades = handleList(parsed[tag][0], parseTradeCardbound);
				break;
		}
	}
}

/**
 * Represents the wider card world of the NationStates multiverse. Only stores the data returned
 * by the API, without implementing any additional functions to do stuff with it.
 */
class CardWorld {
	constructor(parsed) {
		if(parsed['$name'] !== 'CARDS') throw new Error('Invalid XML root');
		for(let tag in parsed) switch(tag) {

			case 'AUCTIONS':
				/**
				 * List of all auctions currently going on.
				 * @type Auction[]
				 * @see {@linkcode CardShard.AUCTIONS}
				 */
				this.auctions = handleList(parsed[tag][0], parseAuction);
				break;

			case 'COLLECTION':
				/**
				 * Details of the queried collection.
				 * @type Collection
				 * @see {@linkcode CardShard.COLLECTION_DETAILS}
				 */
				this.collectionDetail = handle(parsed[tag][0], parseCollection);
				break;

			case 'COLLECTIONS':
				/**
				 * List of all collections owned by the queried nation.
				 * @type ListCollection[]
				 * @see {@linkcode CardShard.COLLECTIONS}
				 */
				this.collections = handleList(parsed[tag][0], parseCollectionOverview);
				break;

			case 'DECK':
				/**
				 * List of all cards in the deck of the queried nation.
				 * @type ListCard[]
				 * @see {@linkcode CardShard.CARDS}
				 */
				this.cards = handleList(parsed[tag][0], parseCardItem);
				break;

			case 'INFO':
				/**
				 * Summary of the queried nation's deck.
				 * @type Deck
				 * @see {@linkcode CardShard.DECK_SUMMARY}
				 */
				this.deckSummary = handle(parsed[tag][0], parseDeckSummary);
				break;

			case 'TRADES':
				/**
				 * List of the world-wide card trades matching the query filter.
				 * @type Trade[]
				 * @see {@linkcode CardShard.TRADES}
				 */
				this.trades = handleList(parsed[tag][0], parseTrade);
				break;
		}
	}
}

exports.Card = Card;
exports.CardWorld = CardWorld;
exports.CardWorldRequest = CardWorldRequest;
exports.CardIndividualRequest = CardIndividualRequest;
