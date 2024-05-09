/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	ArrayFactory,
	convertNumber,
	convertArray
} = require('../factory');
const types = require('../types');

const Happening = require('./happening');
const Proposal = require('./proposal');
const Resolution = require('./resolution');

/**
 * @type {import('../factory').FactoryConstructor<types.WorldAssembly>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.set('council', root['council'], convertNumber)
	.onTag('LASTRESOLUTION', (me) => me
		.build('lastResolution'))
	.onTag('DELEGATES', (me) => me
		.build('delegates', convertArray(',')))
	.onTag('NUMDELEGATES', (me) => me
		.build('delegatesNum', convertNumber))
	.onTag('MEMBERS', (me) => me
		.build('members', convertArray(',')))
	.onTag('NUMNATIONS', (me) => me
		.build('membersNum', convertNumber))
	.onTag('HAPPENINGS', (me) => me
		.build('happenings')
		.assignSubFactory(ArrayFactory
			.complex('EVENT', Happening.create)))
	.onTag('PROPOSALS', (me) => me
		.build('proposals')
		.assignSubFactory(ArrayFactory
			.complex('PROPOSAL', Proposal.create)))
	.onTag('RESOLUTION', (me, attrs) => me
		.build('resolution')
		.assignSubFactory(Resolution.create(attrs)));
