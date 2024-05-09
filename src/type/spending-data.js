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
 * @type {import('../factory').FactoryConstructor<types.SpendingData>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.onTag('ADMINISTRATION', (me) => me
		.build('admin', convertNumber))
	.onTag('DEFENCE', (me) => me
		.build('defence', convertNumber))
	.onTag('EDUCATION', (me) => me
		.build('education', convertNumber))
	.onTag('ENVIRONMENT', (me) => me
		.build('nature', convertNumber))
	.onTag('HEALTHCARE', (me) => me
		.build('healthcare', convertNumber))
	.onTag('COMMERCE', (me) => me
		.build('industry', convertNumber))
	.onTag('INTERNATIONALAID', (me) => me
		.build('aid', convertNumber))
	.onTag('LAWANDORDER', (me) => me
		.build('order', convertNumber))
	.onTag('PUBLICTRANSPORT', (me) => me
		.build('transport', convertNumber))
	.onTag('SOCIALEQUALITY', (me) => me
		.build('social', convertNumber))
	.onTag('SPIRITUALITY', (me) => me
		.build('religion', convertNumber))
	.onTag('WELFARE', (me) => me
		.build('welfare', convertNumber));
