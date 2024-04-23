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
 * Represents a change in a nation's performance on a World Census scale.
 * @typedef {object} RankChange
 * @prop {number} scale Affected {@link CensusScale}.
 * @prop {number} changeAbsolute Score change on the scale in its units.
 * @prop {number} changeRelative Score change on the scale in percent.
 * @prop {number} newScore New (absolute) score on the scale.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<RankChange>} A new `RankChange` factory
 */
exports.create = root => new NSFactory()
	.set('scale', root['id'], convertNumber)
	.onTag('CHANGE', me => me
		.build('changeAbsolute', convertNumber))
	.onTag('PCHANGE', me => me
		.build('changePercent', convertNumber))
	.onTag('SCORE', me => me
		.build('newScore', convertNumber));
