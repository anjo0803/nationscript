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
 * Container object for national score averages on a given World Census scale.
 * @typedef {object} WCensusAverage
 * @prop {number} id ID of the {@linkcode CensusScale} the average is for.
 * @prop {number} average World-wide average score of nations on the scale.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<WCensusAverage>} A new `WCensusAverage` factory
 */
exports.create = (root) => new NSFactory()
	.set('id', convertNumber(root['id']))
	.onTag('SCORE', (me) => me
		.build('average', convertNumber));
