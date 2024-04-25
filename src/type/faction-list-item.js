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
 * Represents an N-Day faction with only the most basic information present, as
 * when displayed as part of a listing of multiple factions. 
 * @typedef {object} ListFaction
 * @prop {number} id Faction ID.
 * @prop {string} name Faction name.
 * @prop {number} score Faction score.
 * @prop {string} region Name of the founding region (`Proper Form`).
 * @prop {number} numMembers Number of nations that are members of the faction.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<ListFaction>} A new `ListFaction` factory
 */
exports.create = (root) => new NSFactory()
	.set('id', root['id'], convertNumber)
	.onTag('NAME', (me) => me
		.build('name'))
	.onTag('SCORE', (me) => me
		.build('score', convertNumber))
	.onTag('REGION', (me) => me
		.build('region'))
	.onTag('NATIONS', (me) => me
		.build('numMembers', convertNumber));
