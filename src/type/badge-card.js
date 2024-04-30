/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { CardBadgeType } = require('../enums');
const {
	ArrayFactory,
	convertNumber,
	NSFactory
} = require('../factory');

/**
 * Represents a commendation, condemnation, liberation, or injunction badge
 * displayed on a nation or region.
 * @typedef {object} CardBadge
 * @prop {string} type {@link CardBadgeType} of the badge.
 * @prop {number} data For Commendation/Condemnation badges, the ID of the
 *     instituting SC resolution. For authorship and easter egg badges, the
 *     count of authorships/easter eggs found. For others, `1`.
 */
/**
 * @returns {ArrayFactory<CardBadge>} A new `CardBadge` array factory.
 */
exports.createArray = () => ArrayFactory.complex('BADGE', exports.create);

/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<CardBadge>} A new `CardBadge` factory
 */
exports.create = (root) => {
	let ret = new NSFactory();

	// Commendation/Condemnation badges: Type sits in a type attribute,
	// the instituting resolution (the data) is in the text node.
	if(root['type']) return ret
		.set('type', root['type'])
		.build('data', convertNumber);

	// The others: There is no attribute, the type is in the text node.
	// If there is weight data, it is in brackets at the end of the text.
	return ret.build('', val => {
		let data = val.match(/\d+/);
		return {
			type: val.replace(/s? \(x?\d+\)/, ''),
			data: data ? convertNumber(data[0]) : 1
		};
	})
}
