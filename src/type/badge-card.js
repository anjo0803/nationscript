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

/**
 * @returns {ArrayFactory<types.CardBadge>} A new `CardBadge` array factory.
 * @ignore
 */
exports.createArray = () => ArrayFactory.complex('BADGE', exports.create);

/**
 * @type {import('../factory').FactoryConstructor<types.CardBadge>}
 * @ignore
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
