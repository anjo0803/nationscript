/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { EmbassyPhase } = require('../enums');
const {
	NSFactory
} = require('../factory');

/**
 * Represents a regional embassy.
 * @typedef {object} Embassy
 * @prop {string} phase The embassy's current {@link EmbassyPhase}.
 * @prop {string} region Region the embassy is for (`Proper Form`).
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<Embassy>} A new `Embassy` factory.
 */
exports.create = root => new NSFactory()
	.set('type', root['type'] ?? EmbassyPhase.STANDING)
	.build('region');
