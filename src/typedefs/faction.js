/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	num,
	txt
} = require('../requests/converter');

/**
 * Represents an N-Day faction.
 * @typedef {object} Faction
 * @prop {number} id ID of the faction.
 * @prop {string} name Name of the faction.
 * @prop {string} description Description of the faction, similar to a regional WFE.
 * @prop {number} created Unix epoch timestamp of when the faction was founded.
 * @prop {string} region Name of the region that founded the faction.
 * @prop {number} entry TODO: Entry status code meanings
 * @prop {number} score Current score of the faction: `strikes` minus `radiation`.
 * @prop {number} strikes Total number of nukes fired by faction members that hit their target.
 * @prop {number} radiation Total number of nukes that have hit members of the faction.
 * @prop {number} production Total number of production units between faction members.
 * @prop {number} nukes Total number of nukes stockpiled by faction members.
 * @prop {number} shields Total number of shields stockpiled by faction members.
 * @prop {number} targets Total number of nukes faction members are currently readying.
 * @prop {number} launches Total number of faction member nukes currently in the air.
 * @prop {number} targeted Total number of nukes currently readied against faction members.
 * @prop {number} incoming Total number of nukes currently flying towards faction members.
 */
/**
 * Builds a faction details object from the provided parsed response XML.
 * @param {object} faction The root object - the `<FACTION>` tag in the parsed XML object.
 * @returns {Faction} The built faction details object.
 * @ignore
 */
exports.parseFactionDetails = (faction) => {
	return {
		id:			num(faction, 'ID'),
		name:		txt(faction, 'NAME'),
		description:txt(faction, 'DESC'),
		created:	num(faction, 'FOUNDED'),
		region:		txt(faction, 'RNAME'),
		entry:		num(faction, 'ENTRY'),
		score:		num(faction, 'SCORE'),
		strikes:	num(faction, 'STRIKES'),
		radiation:	num(faction, 'RADIATION'),
		production:	num(faction, 'PRODUCTION'),
		nukes:		num(faction, 'NUKES'),
		shields:	num(faction, 'SHIELD'),
		targets:	num(faction, 'TARGETS'),
		launches:	num(faction, 'LAUNCHES'),
		targeted:	num(faction, 'TARGETED'),
		incoming:	num(faction, 'INCOMING')
	};
}
