/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	ArrayFactory,
	NSFactory,
	convertBoolean
} = require('../factory');
const Policy = require('./policy');
const RankChange = require('./rank-change');
const Reclassification = require('./reclassification');

/**
 * Represents an ongoing auction on a card.
 * @typedef {object} IssueEffect
 * @prop {boolean} ok Whether everything went alright, I guess?
 * @prop {string} legislation The effect line of the chosen issue option.
 * @prop {string[]} headlines List of all generated newspaper headlines.
 * @prop {string[]} banners List of the banner codes of banners newly unlocked.
 * @prop {Policy.Policy[]} policiesEnacted List of all national
 *     policies newly enacted.
 * @prop {Policy.Policy[]} policiesCancelled List of all national
 *     policies newly rescinded.
 * @prop {RankChange.RankChange[]} census List of changes to the nation's
 *     census scores.
 * @prop {Reclassification.Reclassification[]} reclassifications List of
 *     reclassifications of the nation's freedom levels.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<IssueEffect>} A new `IssueEffect` factory
 */
exports.create = (root) => new NSFactory()
	.onTag('OK', (me) => me
		.build('ok', convertBoolean))
	.onTag('DESC', (me) => me
		.build('legislation'))
	.onTag('HEADLINES', (me) => me
		.build('headlines')
		.assignSubFactory(ArrayFactory.default('', (me) => me
			.build(''))))	// TODO
	.onTag('UNLOCKS', (me) => me
		.build('banners')
		.assignSubFactory(ArrayFactory.default('', (me) => me
			.build(''))))	// TODO
	.onTag('NEW_POLICIES', (me) => me
		.build('policiesEnacted')
		.assignSubFactory(ArrayFactory.default('POLICY', (me, attrs) => me
			.build('')
			.assignSubFactory(Policy.create(attrs)))))
	.onTag('REMOVED_POLICIES', (me) => me
		.build('policiesCancelled')
		.assignSubFactory(ArrayFactory.default('POLICY', (me, attrs) => me
			.build('')
			.assignSubFactory(Policy.create(attrs)))))
	.onTag('RANKINGS', (me) => me
		.build('census')
		.assignSubFactory(ArrayFactory.default('RANK', (me, attrs) => me
			.build('')
			.assignSubFactory(RankChange.create(attrs)))))
	.onTag('RECLASSIFICATIONS', (me) => me
		.build('reclassifications')
		.assignSubFactory(ArrayFactory.default('RECLASSIFY', (me, attrs) => me
			.build('')
			.assignSubFactory(Reclassification.create(attrs)))))

	// If there are no changes to these, the API will not return an empty tag,
	// but no tag at all; thus, these need an empty value set from the start
	.set('banners', [])
	.set('policiesEnacted', [])
	.set('policiesCancelled', [])
	.set('census', [])
	.set('reclassifications', []);
