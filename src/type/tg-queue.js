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
 * Container object specifying the total number of telegrams that are currently
 * awaiting delivery, divided by the type of queue.
 * @typedef {object} TGQueue
 * @prop {number} manual Number of manually-sent telegrams.
 * @prop {number} mass Number of mass telegrams.
 * @prop {number} api Number of telegrams sent via the API.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<TGQueue>} A new `TGQueue` factory
 */
exports.create = (root) => new NSFactory()
	.onTag('MANUAL', (me) => me
		.build('manual', convertNumber))
	.onTag('MASS', (me) => me
		.build('mass', convertNumber))
	.onTag('API', (me) => me
		.build('api', convertNumber));
