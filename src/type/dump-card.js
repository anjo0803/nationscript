/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { Rarity } = require('../enums');
const {
	NSFactory,
	DumpFactory,
	ArrayFactory,
	convertNumber
} = require('../factory');
const CardBadge = require('./badge-card');
const Trophy = require('./trophy');

/**
 * Represents a trading card in the NationStates multiverse, containing all the
 * data saved for the card in the requested season's one-off Dump.
 * @typedef {object} DumpCard
 * @prop {number} id Card ID; corresponds to the depicted nation's `dbID`.
 * @prop {import('./card').CardNation} depicted Details of the nation depicted
 *     on the card.
 * @prop {string} rarity The card's {@link Rarity}.
 * @prop {Trophy.Trophy[]} trophies Displayed World Census ranking trophies.
 * @prop {CardBadge.CardBadge[]} badges Displayed miscellaneous badges.
 */
/**
 * @arg {import('../factory').FactoryDecider<DumpCard>} decider Decider function to use
 * @returns {(decider) => NSFactory<DumpCard[]>} A new `DumpCard` factory
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
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<DumpCard>} A new `DumpCard` factory
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
		.build('description'))	// TODO
	.onTag('TROPHIES', (me) => me
		.build('trophies')
		.assignSubFactory(ArrayFactory
			.complex('TROPHY', Trophy.create)))
	.onTag('BADGES', (me) => me
		.build('badges')
		.assignSubFactory(CardBadge.createArray()));
