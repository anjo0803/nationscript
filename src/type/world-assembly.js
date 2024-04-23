/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	WACouncil
} = require('../enums');

const {
	NSFactory,
	ArrayFactory,
	convertNumber,
	convertArray
} = require('../factory');

const Happening = require('./happening');
const Proposal = require('./proposal');
const Resolution = require('./resolution');

/**
 * Represents a council of the World Assembly in the NationStates multiverse,
 * containing all the data requested from the World Assembly API.
 * @typedef {object} WorldAssembly
 * @prop {number} council {@link WACouncil} that this object concerns.
 * @prop {string} [lastResolution] Description of the result of the last vote.
 * @prop {string[]} [delegates] Currently serving WA delegates (`id_form`).
 * @prop {number} [delegatesNum] Number of currently serving WA delegates.
 * @prop {string[]} [members] Current WA member nations (`id_form`).
 * @prop {number} [membersNum] Number of current WA member nations.
 * @prop {Happening.Happening[]} [happenings] Recent WA happening events.
 * @prop {Proposal.Proposal[]} [proposals] Current proposals.
 * @prop {Resolution.Resolution} [resolution] Details of the at-vote (or the
 *     queried) resolution.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<WorldAssembly>} A new `WorldAssembly` factory
 */
exports.create = root => new NSFactory()
	.set('council', root['council'], convertNumber)
	.onTag('LASTRESOLUTION', me => me
		.build('lastResolution'))
	.onTag('DELEGATES', me => me
		.build('delegates', convertArray(',')))
	.onTag('NUMDELEGATES', me => me
		.build('delegatesNum', convertNumber))
	.onTag('MEMBERS', me => me
		.build('members', convertArray(',')))
	.onTag('NUMNATIONS', me => me
		.build('membersNum', convertNumber))
	.onTag('HAPPENINGS', me => me
		.build('happenings')
		.assignSubFactory(ArrayFactory.default('EVENT', (me, attrs) => me
			.build('')
			.assignSubFactory(Happening.create(attrs)))))
	.onTag('PROPOSALS', me => me
		.build('proposals')
		.assignSubFactory(ArrayFactory.default('PROPOSAL', (me, attrs) => me
			.build('')
			.assignSubFactory(Proposal.create(attrs)))))
	.onTag('RESOLUTION', (me, attrs) => me
		.build('resolution')
		.assignSubFactory(Resolution.create(attrs)));
