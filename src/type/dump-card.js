/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	DumpFactory,
	ArrayFactory,
	convertNumber
} = require('../factory');
const types = require('../types');

const CardBadge = require('./badge-card');
const Trophy = require('./trophy');

/**
 * @type {import('../requests/dump').DumpFactoryConstructor<types.DumpCard>}
 * @ignore
 */
exports.createArray = (decider) => (root) => new NSFactory()
	// The actual data is wrapped in a <SET> tag
	.onTag('SET', (me, attrs) => me
		.build('')
		.assignSubFactory(new DumpFactory(decider)
			.onTag('CARD', (me, attrs) => me
				.build('')
				.assignSubFactory(createDumpCard(attrs)))));

/**
 * Since the Cards dump names its fields differently, a special factory just to
 * construct objects from the dump is needed. This function makes one.
 * @type {import('../factory').FactoryConstructor<types.DumpCard>}
 * @ignore
 */
const createDumpCard = (root) => new NSFactory()
	.onTag('ID', (me) => me
		.build('id', convertNumber))
	.onTag('NAME', (me) => me
		.build('depicted.name'))
	.onTag('TYPE', (me) => me
		.build('depicted.pretitle'))
	.onTag('MOTTO', (me) => me
		.build('depicted.motto'))
	.onTag('CATEGORY', (me) => me
		.build('depicted.category'))
	.onTag('REGION', (me) => me
		.build('depicted.region'))
	.onTag('FLAG', (me) => me
		.build('depicted.flag'))
	.onTag('CARDCATEGORY', (me) => me
		.build('rarity'))
	.onTag('DESCRIPTION', (me) => me
		.build('description'))
	.onTag('TROPHIES', (me) => me
		.build('trophies')
		.assignSubFactory(ArrayFactory
			.complex('TROPHY', Trophy.create)))
	.onTag('BADGES', (me) => me
		.build('badges')
		.assignSubFactory(CardBadge.createArray()));
