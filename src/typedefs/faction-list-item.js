/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	attr,
	num,
	txt
} = require('../requests/converter');

/**
 * Represents an N-Day faction with only the most basic information present, as when displayed as
 * part of a listing of multiple factions. 
 * @typedef {object} ListFaction
 * @prop {number} id ID of the faction.
 * @prop {string} name Name of the faction.
 * @prop {number} score Current score of the faction.
 * @prop {string} region Name of the region that founded the faction.
 * @prop {number} numMembers Total number of nations that are members of the faction.
 */
/**
 * Builds a faction object from the provided parsed response XML.
 * @param {object} faction The root object - a `<FACTION>` tag in the parsed XML object.
 * @returns {ListFaction} The built faction object.
 * @ignore
 */
exports.parseFaction = (faction) => {
	return {
		id: parseInt(attr(faction, 'ID')),
		name:		txt(faction, 'NAME'),
		score:		num(faction, 'SCORE'),
		region:		txt(faction, 'REGION'),
		numMembers:	num(faction, 'NATIONS')
	};
}
