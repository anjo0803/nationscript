/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { OfficerAuthority } = require('../enums');
const {
	NSFactory,
	convertNumber,
	convertArray
} = require('../factory');

/**
 * Represents a regional officer of a region.
 * @typedef {object} Officer
 * @prop {string} nation Nation holding the office (`id_form`).
 * @prop {string} office Name of the office.
 * @prop {string} appointer Nation that appointed the officer (`id_form`).
 * @prop {string[]} authorities {@link OfficerAuthority} codes for the officer.
 * @prop {number} appointment Timestamp of the officer's appointment.
 * @prop {number} order Position on which the officer is displayed (1-indexed).
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<Officer>} A new `Officer` factory
 */
exports.create = (root) => new NSFactory()
	.onTag('NATION', (me) => me
		.build('nation'))
	.onTag('OFFICE', (me) => me
		.build('office'))
	.onTag('BY', (me) => me
		.build('appointer'))
	.onTag('AUTHORITY', (me) => me
		.build('authorities', convertArray('')))
	.onTag('TIME', (me) => me
		.build('appointment', convertNumber))
	.onTag('ORDER', (me) => me
		.build('order', convertNumber));
