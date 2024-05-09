/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	ArrayFactory,
	convertNumber
} = require('../factory');
const types = require('../types');

const ListCard = require('./card-list-item');

/**
 * @type {import('../factory').FactoryConstructor<types.Collection>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.onTag('NAME', (me) => me
		.build('name'))
	.onTag('NATION', (me) => me
		.build('owner'))
	.onTag('UPDATED', (me) => me
		.build('edited', convertNumber))
	.onTag('DECK', (me) => me
		.build('cards')
		.assignSubFactory(ArrayFactory
			.complex('CARD', ListCard.create)));
