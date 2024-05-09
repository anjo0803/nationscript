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

const LegalityDecision = require('./legality-decision');

/**
 * @type {import('../factory').FactoryConstructor<types.LegalityData>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.onTag('DISCARD', (me) => me
		.build('discard')
		.assignSubFactory(ArrayFactory
			.primitive('DISCARD')))
	.onTag('ILLEGAL', (me) => me
		.build('illegal')
		.assignSubFactory(ArrayFactory
			.primitive('ILLEGAL')))
	.onTag('LEGAL', (me) => me
		.build('legal')
		.assignSubFactory(ArrayFactory
			.primitive('LEGAL')))
	.onTag('LOG', (me) => me
		.build('log')
		.assignSubFactory(ArrayFactory
			.complex('ENTRY', LegalityDecision.create)));
