/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { CensusScale } = require('../enums');
const {
	NSFactory,
	convertNumber
} = require('../factory');

/**
 * 
 * @typedef {object} CensusDescription
 * @prop {number} id ID of the {@link CensusScale} the descriptions are for.
 * @prop {string} national Description of the scale's national rankings.
 * @prop {string} regional Description of the scale's regional rankings.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<CensusDescription>} A new `CensusDescription` factory
 */
exports.create = root => new NSFactory()
	.set('id', root['id'], convertNumber)
	.onTag('NDESC', me => me
		.build('national'))
	.onTag('RDESC', me => me
		.build('regional'));
