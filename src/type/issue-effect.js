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
const Policy = require('./policy');
const RankChange = require('./rank-change');
const Reclassification = require('./reclassification');

/**
 * Represents the outcome of the chosen answer on an issue.
 * @typedef {object} IssueEffect
 * @prop {number} issue ID of the issue that was answered.
 * @prop {number} option (Issue-internal) ID of the option that was chosen.
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
	.set('issue', root['id'], convertNumber)
	.set('option', root['choice'], convertNumber)
	.onTag('OK', (me) => me
		.build('ok', convertBoolean))
	.onTag('DESC', (me) => me
		.build('legislation'))
	.onTag('HEADLINES', (me) => me
		.build('headlines')
		.assignSubFactory(ArrayFactory
			.primitive('HEADLINE')))	// TODO
	.onTag('UNLOCKS', (me) => me
		.build('banners')
		.assignSubFactory(ArrayFactory.default('', (me) => me
			.build(''))))	// TODO
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
