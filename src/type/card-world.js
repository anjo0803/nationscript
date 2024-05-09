/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	ArrayFactory
} = require('../factory');
const types = require('../types');

const Auction = require('./auction');
const Collection = require('./collection');
const ListCollection = require('./collection-list-item');
const ListCard = require('./card-list-item');
const Deck = require('./deck');
const Trade = require('./trade');

/**
 * @type {import('../factory').FactoryConstructor<types.CardWorld>}
 * @ignore
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
			.complex('TRADE', Trade.create)));
