/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	convertNumber
} = require('../factory');

/**
 * Container object for data on a nation's government spending by field, in
 * percentages.
 * @typedef {object} SpendingData
 * @prop {number} admin Percentage spent on the bureaucracy.
 * @prop {number} defence Percentage spent on defence.
 * @prop {number} education Percentage spent on education.
 * @prop {number} nature Percentage spent on environmental stuff.
 * @prop {number} healthcare Percentage spent on the healthcare system.
 * @prop {number} industry Percentage spent on corporate welfare.
 * @prop {number} aid Percentage spent on providing international aid.
 * @prop {number} order Percentage spent on law enforcement.
 * @prop {number} transport Percentage spent on the public transport system.
 * @prop {number} social Percentage spent on social policy.
 * @prop {number} religion Percentage spent on spiritual policy.
 * @prop {number} welfare Percentage spent on the welfare system.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<SpendingData>} A new `SpendingData` factory
 */
exports.create = root => new NSFactory()
	.onTag('ADMINISTRATION', me => me
		.build('admin', convertNumber))
	.onTag('DEFENCE', me => me
		.build('defence', convertNumber))
	.onTag('EDUCATION', me => me
		.build('education', convertNumber))
	.onTag('ENVIRONMENT', me => me
		.build('nature', convertNumber))
	.onTag('HEALTHCARE', me => me
		.build('healthcare', convertNumber))
	.onTag('COMMERCE', me => me
		.build('industry', convertNumber))
	.onTag('INTERNATIONALAID', me => me
		.build('aid', convertNumber))
	.onTag('LAWANDORDER', me => me
		.build('order', convertNumber))
	.onTag('PUBLICTRANSPORT', me => me
		.build('transport', convertNumber))
	.onTag('SOCIALEQUALITY', me => me
		.build('social', convertNumber))
	.onTag('SPIRITUALITY', me => me
		.build('religion', convertNumber))
	.onTag('WELFARE', me => me
		.build('welfare', convertNumber));
