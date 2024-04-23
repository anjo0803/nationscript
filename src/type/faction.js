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
 * Represents an N-Day faction.
 * @typedef {object} Faction
 * @prop {number} id Faction ID.
 * @prop {string} name Faction name.
 * @prop {string} description Faction description.
 * @prop {number} created Timestamp of the faction's founding.
 * @prop {string} region Name of the founding region (`Proper Form`).
 * @prop {number} entry 
 * @prop {number} score Faction score - `strikes` minus `radiation`.
 * @prop {number} strikes Number of nukes launched by faction members that
 *     successfully hit their target.
 * @prop {number} radiation Number of nukes that have hit faction members.
 * @prop {number} production Amount of production stored by faction members.
 * @prop {number} nukes Number of nukes stockpiled by faction members.
 * @prop {number} shields Number of shields stockpiled by faction members.
 * @prop {number} targets Number of nukes faction members are aiming.
 * @prop {number} launches Number of nukes faction members are launching.
 * @prop {number} targeted Number of nukes aimed at faction members.
 * @prop {number} incoming Number of nukes launched at faction members.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<Faction>} A new `Faction` factory
 */
exports.create = root => new NSFactory()
	.onTag('ID', me => me
		.build('id', convertNumber))
	.onTag('NAME', me => me
		.build('name'))
	.onTag('DESC', me => me
		.build('description'))
	.onTag('FOUNDED', me => me
		.build('created', convertNumber))
	.onTag('RNAME', me => me
		.build('region'))
	.onTag('ENTRY', me => me
		.build('entry', convertNumber))
	.onTag('SCORE', me => me
		.build('score', convertNumber))
	.onTag('STRIKES', me => me
		.build('strikes', convertNumber))
	.onTag('RADIATION', me => me
		.build('radiation', convertNumber))
	.onTag('PRODUCTION', me => me
		.build('production', convertNumber))
	.onTag('NUKES', me => me
		.build('nukes', convertNumber))
	.onTag('SHIELD', me => me
		.build('shields', convertNumber))
	.onTag('TARGETS', me => me
		.build('targets', convertNumber))
	.onTag('LAUNCHES', me => me
		.build('launches', convertNumber))
	.onTag('TARGETED', me => me
		.build('targeted', convertNumber))
	.onTag('INCOMING', me => me
		.build('incoming', convertNumber));
