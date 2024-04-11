/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { WACategory } = require('../enums');
const {
	handle,
	handleList,

	attr,
	arr,
	num,
	txt
} = require('../requests/converter');

/**
 * Represents a proposal for a new resolution currently before the delegates of the World Assembly.
 * @typedef {object} Proposal
 * @prop {string} id ID of the proposal.
 * @prop {string} title Title of the proposal.
 * @prop {string} author Name of the nation that submitted the proposal.
 * @prop {string} text Body text of the proposal.
 * @prop {string[]} approvals List with the names of all WA delegates approving the proposal.
 * @prop {number} submitted Unix epoch timestamp of when the proposal was submitted.
 * @prop {string} category {@linkcode WACategory} the proposal was submitted under.
 * @prop {string} option Depending on the category, either the resolution's subcategory or target.
 * @prop {LegalityData} legality Details of rulings on the proposal's compliance with WA rules.
 */
/**
 * Builds a proposal object from the provided parsed response XML.
 * @param {object} p The root object - a `<PROPOSAL>` tag in the parsed XML object.
 * @returns {Proposal} The built proposal object.
 * @ignore
 */
exports.parseProposal = (p) => {
	return {
		id:			attr(p, 'ID'),
		title:		txt(p, 'NAME'),
		author:		txt(p, 'PROPOSED_BY'),
		text:		txt(p, 'DESC'),
		approvals:	txt(p, 'APPROVALS')?.split(':') ?? [],
		submitted:	num(p, 'CREATED'),
		category:	txt(p, 'CATEGORY'),
		option:		txt(p, 'OPTION'),
		// The <GENSEC> tag isn't returned by the API if there was no legality ruling yet
		legality: handle(p['GENSEC'] ?? {LOG: []}, parseLegality)
	};
}

/**
 * Container object holding data on a {@linkcode Proposal}'s current legal status - that
 * is, the decisions of Moderators or General Secretariat members on its rule compliance.
 * @typedef {object} LegalityData
 * @prop {string[]} legal List with the names of the nations ruling the proposal legal.
 * @prop {string[]} illegal List with the names of the nations ruling the proposal illegal.
 * @prop {string[]} discard List with the names of the nations voting to discard the proposal.
 * @prop {LegalityDecision[]} log Complete list of rulings made on the proposal.
 */
/**
 * Builds a legality object from the provided parsed response XML.
 * @param {object} root The root object - the `<GENSEC>` tag in the parsed XML object.
 * @returns {LegalityData} The built legality object.
 * @ignore
 */
function parseLegality(root) {
	return {
		discard:	arr(root, 'DISCARD') ?? [],
		illegal:	arr(root, 'ILLEGAL') ?? [],
		legal:		arr(root, 'LEGAL') ?? [],
		log: handleList(root['LOG'], parseLegalityDecision)
	}
}

/**
 * Represents a ruling of a Moderator or a member of the General Secretariat
 * concerning the legality of a concrete {@linkcode Proposal}.
 * @typedef {object} LegalityDecision
 * @prop {string} nation Name of the nation that made the ruling.
 * @prop {('Legal' | 'Illegal' | 'Discard')} decision The ruling made.
 * @prop {string} reason Comment attached to the ruling by the nation that made it.
 * @prop {number} timestamp Unix epoch timestamp of when the ruling was made.
 */
/**
 * Builds a legality-decision object from the provided parsed response XML.
 * @param {object} decision The root object - an `<ENTRY>` tag in the parsed XML object.
 * @returns {Proposal} The built legality-decision object.
 * @ignore
 */
function parseLegalityDecision(decision) {
	return {
		nation:		txt(decision, 'NATION'),
		decision:	txt(decision, 'DECISION'),
		reason:		txt(decision, 'REASON') ?? '',
		timestamp:	num(decision, 'T')
	}
}
