/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory
} = require('../factory');

/**
 * Represents a reclassification of a nation's level of civil, economic, or
 * political freedom through an {@link AnsweredIssue}.
 * @typedef {object} Reclassification
 * @prop {number} category The {@link ReclassificationCategory}.
 * @prop {string} from Level of the freedom prior to answering the issue.
 * @prop {string} to Level of the freedom after answering the issue.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<Reclassification>} A new `Reclassification` factory
 */
exports.create = root => new NSFactory()
	.set('category', root['type'])
	.onTag('FROM', me => me
		.build('from'))
	.onTag('TO', me => me
		.build('to'));
