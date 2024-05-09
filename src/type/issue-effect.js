/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	ArrayFactory,
	NSFactory,
	convertNumber,
	convertBoolean
} = require('../factory');
const types = require('../types');

const Policy = require('./policy');
const RankChange = require('./rank-change');
const Reclassification = require('./reclassification');

/**
 * @type {import('../factory').FactoryConstructor<types.IssueEffect>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.set('issue', root['id'], convertNumber)
	.set('option', root['choice'], convertNumber)
	.onTag('OK', (me) => me
		.build('ok', convertBoolean))
	.onTag('DESC', (me) => me
		.build('legislation'))
	.onTag('HEADLINES', (me) => me
		.build('headlines')
		.assignSubFactory(ArrayFactory
			.primitive('HEADLINE')))
	.onTag('UNLOCKS', (me) => me
		.build('banners')
		.assignSubFactory(ArrayFactory
			.primitive('BANNER')))
	.onTag('NEW_POLICIES', (me) => me
		.build('policiesEnacted')
		.assignSubFactory(ArrayFactory
			.complex('POLICY', Policy.create)))
	.onTag('REMOVED_POLICIES', (me) => me
		.build('policiesCancelled')
		.assignSubFactory(ArrayFactory
			.complex('POLICY', Policy.create)))
	.onTag('RANKINGS', (me) => me
		.build('census')
		.assignSubFactory(ArrayFactory
			.complex('RANK', RankChange.create)))
	.onTag('RECLASSIFICATIONS', (me) => me
		.build('reclassifications')
		.assignSubFactory(ArrayFactory
			.complex('RECLASSIFY', Reclassification.create)))

	// If there are no changes to these, the API will not return an empty tag,
	// but no tag at all; thus, these need an empty value set from the start
	.set('banners', [])
	.set('policiesEnacted', [])
	.set('policiesCancelled', [])
	.set('census', [])
	.set('reclassifications', []);
