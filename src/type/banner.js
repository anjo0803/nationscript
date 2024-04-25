/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory
} = require('../factory');

/**
 * Represents a national banner.
 * @typedef {object} Banner
 * @prop {string} id ID of the banner.
 * @prop {string} name Full name of the banner.
 * @prop {string} condition Vague description of the banner's unlock condition.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<Banner>} A new `Banner` factory
 */
exports.create = (root) => new NSFactory()
	.set('id', root['id'])
	.onTag('NAME', (me) => me
		.build('name'))
	.onTag('VALIDITY', (me) => me
		.build('condition'))
