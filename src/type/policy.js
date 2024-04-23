/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory
} = require('../factory');

/**
 * Represents a national policy.
 * @typedef {object} Policy
 * @prop {string} category General field the policy concerns.
 * @prop {string} name Name of the policy.
 * @prop {string} description Short description of the policy content.
 * @prop {string} image ID of the policy banner image.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<Policy>} A new `Policy` factory
 */
exports.create = root => new NSFactory()
	.onTag('CAT', me => me
		.build('category'))
	.onTag('NAME', me => me
		.build('name'))
	.onTag('DESC', me => me
		.build('description'))
	.onTag('PIC', me => me
		.build('image'));
