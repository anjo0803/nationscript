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
 * Represents an option that may be chosen to answer an issue.
 * @typedef {object} IssueOption
 * @prop {number} id Issue-internal ID of the option.
 * @prop {string} text Body text describing the option.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<IssueOption>} A new `IssueOption` factory
 */
exports.create = (root) => new NSFactory()
	.set('id', root['id'], convertNumber)
	.build('text');
