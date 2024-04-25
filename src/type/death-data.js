/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { DeathCause } = require('../enums');
const {
	NSFactory,
	convertNumber
} = require('../factory');

/**
 * Represents a cause of death with its prevalence in a nation.
 * @typedef {object} DeathData
 * @prop {string} cause {@linkcode DeathCause} the data describes.
 * @prop {number} percent Percentage of deaths in the nation due to the cause.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<DeathData>} A new `DeathData` factory
 */
exports.create = (root) => new NSFactory()
	.set('cause', root['type'])
	.build('percent', convertNumber);
