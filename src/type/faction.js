/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	convertNumber
} = require('../factory');
const types = require('../types');

/**
 * @type {import('../factory').FactoryConstructor<types.Faction>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.onTag('ID', (me) => me
		.build('id', convertNumber))
	.onTag('NAME', (me) => me
		.build('name'))
	.onTag('DESC', (me) => me
		.build('description'))
	.onTag('FOUNDED', (me) => me
		.build('created', convertNumber))
	.onTag('RNAME', (me) => me
		.build('region'))
	.onTag('ENTRY', (me) => me
		.build('entry', convertNumber))
	.onTag('SCORE', (me) => me
		.build('score', convertNumber))
	.onTag('STRIKES', (me) => me
		.build('strikes', convertNumber))
	.onTag('RADIATION', (me) => me
		.build('radiation', convertNumber))
	.onTag('PRODUCTION', (me) => me
		.build('production', convertNumber))
	.onTag('NUKES', (me) => me
		.build('nukes', convertNumber))
	.onTag('SHIELD', (me) => me
		.build('shields', convertNumber))
	.onTag('TARGETS', (me) => me
		.build('targets', convertNumber))
	.onTag('LAUNCHES', (me) => me
		.build('launches', convertNumber))
	.onTag('TARGETED', (me) => me
		.build('targeted', convertNumber))
	.onTag('INCOMING', (me) => me
		.build('incoming', convertNumber));
