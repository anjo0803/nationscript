/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { ShardableRequest } = require('./base');
const { WAShard } = require('../shards');
const { WACouncil } = require('../enums');
const {
	attr,
	num,
	txt,

	handle,
	handleList
} = require('./converter');

const { Happening, parseHappening }		= require('../typedefs/happening');
const { Proposal, parseProposal }		= require('../typedefs/proposal');
const { Resolution, parseResolution }	= require('../typedefs/resolution');

/**
 * @summary Request subclass for building and customising requests to the WA endpoint of the API.
 */
class WARequest extends ShardableRequest {
	constructor(council) {
		super('wa');
		this.setArgument('wa', council);
	}

	/**
	 * Specifies a passed resolution to query with the {@linkcode WAShard.RESOLUTION} shard.
	 * If not specified, data on the at-vote resolution, if there is one, is returned.
	 * 
	 * *Note that data for the {@linkcode WAShard.VOTERS}, {@linkcode WAShard.VOTE_TRACK},
	 * {@linkcode WAShard.DELEGATE_VOTES}, and {@linkcode WAShard.DELEGATE_VOTE_LOG} shards is not
	 * available for passed resolutions, so requesting them will have no effect.*
	 * @param {number} id ID of the desired resolution.
	 * @returns {this} The request, for chaining.
	 */
	setResolution(id) {
		return this.setArgument('id', id);
	}

	/**
	 * Sends an HTTP request with all data specified in this request
	 * instance to the API and parses its response.
	 * @returns {Promise<WorldAssembly>} A WA object holding all data returned.
	 */
	async send() {
		return new WorldAssembly(await super.send('WA'));
	}
}

/**
 * Represents a council of the World Assembly in the NationStates multiverse. Only stores the data
 * returned by the API, without implementing any additional functions to do stuff with it.
 */
class WorldAssembly {
	constructor(parsed) {
		if(parsed['$name'] !== 'WA') throw new Error('Invalid XML root');

		/**
		 * ID of the WA council that the returned data concerns.
		 * @see {@linkcode WACouncil} for valid council IDs.
		 */
		this.council = parseInt(attr(parsed, 'COUNCIL'));
		for(let tag in parsed) switch(tag) {

			/* === Primitive Properties === */

			case 'DELEGATES':
				/**
				 * List with the names of all currently serving WA delegates.
				 * @type string[]
				 * @see {@linkcode WAShard.DELEGATES}
				 */
				this.delegates = txt(parsed, tag)?.split(',');
				break;

			case 'LASTRESOLUTION':
				/**
				 * Textual description of the result of the last vote.
				 * @type string
				 * @see {@linkcode WAShard.LAST_RESOLUTION}
				 */
				this.lastResolution = txt(parsed, tag);
				break;

			case 'MEMBERS':
				/**
				 * List with the names of all current WA member nations.
				 * @type string
				 * @see {@linkcode WAShard.MEMBERS}
				 */
				this.members = txt(parsed, tag)?.split(',');
				break;

			case 'NUMDELEGATES':
				/**
				 * Total number of currently serving WA delegates.
				 * @type number
				 * @see {@linkcode WAShard.NUM_DELEGATES}
				 */
				this.delegatesNum = num(parsed, tag);
				break;

			case 'NUMNATIONS':
				/**
				 * Total number of current WA member nations.
				 * @type number
				 * @see {@linkcode WAShard.NUM_MEMBERS}
				 */
				this.membersNum = num(parsed, tag);
				break;


			/* === Complex Properties === */

			case 'HAPPENINGS':
				/**
				 * List of the most recent happening events concerning the WA.
				 * @type Happening[]
				 * @see {@linkcode WAShard.HAPPENINGS}
				 */
				this.happenings = handleList(parsed[tag][0], parseHappening);
				break;

			case 'PROPOSALS':
				/**
				 * List of all proposals currently before the WA delegates.
				 * @type Proposal[]
				 * @see {@linkcode WAShard.PROPOSALS}
				 */
				this.proposals = handleList(parsed[tag][0], parseProposal);
				break;

			case 'RESOLUTION':
				/**
				 * Details of the at-vote or a specified passed resolution.
				 * @type Resolution
				 * @see {@linkcode WAShard.RESOLUTION}
				 */
				this.resolution = handle(parsed[tag][0], parseResolution);
				break;
		}
	}
}

exports.WARequest = WARequest;
exports.WorldAssembly = WorldAssembly;
