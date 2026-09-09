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

const HintCensusScale = require('./stats-hint-scale');
const HintPolicy = require('./stats-hint-policy');

/**
 * @type {import('../factory').FactoryConstructor<types.ResolutionEffectHint>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.onTag('WINNERS', (me) => me
		.build('winners')
		.assignSubFactory(ArrayFactory
			.complex('SCALE', HintCensusScale.create)))
	.onTag('LOSERS', (me) => me
		.build('losers')
		.assignSubFactory(ArrayFactory
			.complex('SCALE', HintCensusScale.create)))
	.onTag('POLICIES', (me) => me
		.build('policies')
		.assignSubFactory(ArrayFactory
			.complex('POLICY', HintPolicy.create)));
