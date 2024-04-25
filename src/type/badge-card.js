/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { CardBadgeType } = require('../enums');
const {
	ArrayFactory,
	convertNumber
} = require('../factory');

/**
 * Represents a commendation, condemnation, liberation, or injunction badge
 * displayed on a nation or region.
 * @typedef {object} CardBadge
 * @prop {string} type {@link CardBadgeType} of the badge.
 * @prop {number} weight For Commendation/Condemnation badges, the ID of the
 *     instituting SC resolution. For authorship and easter egg badges, the
 *     count of authorships/easter eggs found. For others, `NaN`.
 */
/**
 * @returns {ArrayFactory<CardBadge>} A new `CardBadge` array factory.
 */
exports.createArray = () => ArrayFactory.single('BADGE', (me, attrs) => {

	// Commendation/Condemnation badges: Type sits in a type attribute,
	// the instituting resolution (the weight) is in the text node.
	if(attrs['type']) me
		.set('type', attrs['type'])
		.build('weight', convertNumber);

	// The others: There is no attribute, the type is in the text node.
	// If there is a weight, it is in brackets at the end of the text.
	else me.build('type', val => {
		let weight = val.match(/\d+/);
		me.set('weight', weight ? weight[0] : NaN, convertNumber);
		return val.replace(/s? \(x?\d+\)/, '');
	})
});
