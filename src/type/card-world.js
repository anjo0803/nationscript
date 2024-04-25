/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	ArrayFactory
} = require('../factory');

const DumpCards = require('../type/dump-card');

const Auction = require('./auction');
const Collection = require('./collection');
const ListCollection = require('./collection-list-item');
const ListCard = require('./card-list-item');
const Deck = require('./deck');
const Trade = require('./trade');

/**
 * Represents the wider card world of the NationStates multiverse, containing
 * all the data requested from the Card API.
 * @typedef {object} CardWorld
 * @prop {Auction.Auction[]} [auctions] Auctions currently going on.
 * @prop {Collection.Collection} [collectionDetail] The queried collection.
 * @prop {ListCollection.ListCollection[]} [collections] Collections owned by
 *     the queried nation.
 * @prop {ListCard.ListCard[]} [cards] Cards in the deck of the queried nation.
 * @prop {Deck.Deck} [deckSummary] Summary of the queried nation's deck.
 * @prop {Trade.Trade[]} [trades] Trades matching the query filter.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<CardWorld>} A new `CardWorld` factory
 */
exports.create = (root) => new NSFactory()
	.onTag('AUCTIONS', (me) => me
		.build('auctions')
		.assignSubFactory(ArrayFactory
			.complex('AUCTION', Auction.create)))
	.onTag('COLLECTION', (me, attrs) => me
		.build('collectionDetail')
		.assignSubFactory(Collection.create(attrs)))
	.onTag('COLLECTIONS', (me) => me
		.build('collections')
		.assignSubFactory(ArrayFactory
			.complex('COLLECTION', ListCollection.create)))
	.onTag('DECK', (me) => me
		.build('cards')
		.assignSubFactory(ArrayFactory
			.complex('CARD',ListCard.create)))
	.onTag('INFO', (me, attrs) => me
		.build('deckSummary')
		.assignSubFactory(Deck.create(attrs)))
	.onTag('TRADES', (me) => me
		.build('trades')
		.assignSubFactory(ArrayFactory
			.complex('TRADE', Trade.create)))

	/*
	 * This is here for a cheaty work-around: In the matchFactory() function of
	 * the request base module, only the root XML tag is available for matching
	 * factory instances to the XML. Since, however, both the cards Dump and
	 * the results from the cards-world endpoint of the API return XML with a
	 * <CARDS> root, they can't be differentiated at that point.
	 * 
	 * So, the card-world factory is assigned by default. But other than the
	 * card-world XML, the Dump XML is wrapped in *another* tag, namely the
	 * <SET> tag, which contains everything else and is in no case present in
	 * card-world XML.
	 * 
	 * So, if the card-world factory encounters a <SET> tag, it knows that it's
	 * currently handling a card Dump, assigns itself the card-dump factory,
	 * and configures its result to be assigned to the product as a whole,
	 * essentially relaying the dump factory's product.
	 */
	.onTag('SET', (me, attrs) => me
		.build('')
		.assignSubFactory(DumpCards.createArray(attrs)));
