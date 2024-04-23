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
 * Represents the founding details of a newly founded nation.
 * @typedef {object} NewNation
 * @prop {string} nation Name of the nation (`id_style`).
 * @prop {string} region Name of the nation's founding region (`id_style`).
 * @prop {number} founded Timestamp of the founding.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<NewNation>} A new `NewNation` factory
 */
exports.create = root => new NSFactory()
	.set('nation', root['name'])
	.onTag('REGION', me => me
		.build('region'))
	.onTag('FOUNDEDTIME', me => me
		.build('founded', convertNumber));
