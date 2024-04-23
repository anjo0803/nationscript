/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory
} = require('../factory');

/**
 * Container object holding descriptions on a nation's civil, economic, and
 * political freedoms.
 * @typedef {object} FreedomsTextData
 * @prop {string} civil The nation's civil rights situation.
 * @prop {string} economic Extent of economic freedom the nation grants.
 * @prop {string} political Level of the nation's political freedom.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<FreedomsTextData>} A new `FreedomsTextData` factory
 */
exports.create = root => new NSFactory()
	.onTag('CIVILRIGHTS', me => me
		.build('civil'))
	.onTag('ECONOMY', me => me
		.build('economic'))
	.onTag('POLITICALFREEDOM', me => me
		.build('political'));
