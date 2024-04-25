/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { WABadgeType } = require('../enums');
const {
	NSFactory,
	convertNumber
} = require('../factory');

/**
 * Represents a commendation, condemnation, liberation, or injunction badge
 * displayed on a nation or region.
 * @typedef {object} WABadge
 * @prop {number} resolution ID of the SC resolution imposing the badge.
 * @prop {string} type {@link WABadgeType} of the badge.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<WABadge>} A new `WABadge` factory
 */
exports.create = (root) => new NSFactory()
	.set('type', root['type'])
	.build('resolution', convertNumber);
