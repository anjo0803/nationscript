/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Internal module providing a specialised request builder class for fetching
 * data from the World Assembly API.
 * @module nationscript/requests/wa
 */

const { ShardableRequest } = require('./base');
const { WAShard } = require('../shards');
const types = require('../types');

const WorldAssembly = require('../type/world-assembly');

/**
 * Request subclass for building requests to the WA endpoint of the API.
 */
class WARequest extends ShardableRequest {
	constructor(council) {
		super();
		this.mandate('wa')
			.setArgument('wa', council);
	}

	/**
	 * Specify a passed resolution to query the info of. Only affects requests
	 * containing the {@link WAShard.RESOLUTION} shard. If this is not set, the
	 * API will use the at-vote resolution, if there is one.
	 * 
	 * *Note that the {@link WAShard.VOTERS}, {@link WAShard.VOTE_TRACK},
	 * {@link WAShard.DELEGATE_VOTES}, and {@link WAShard.DELEGATE_VOTE_LOG}
	 * shards will not return any info on passed resolutions.*
	 * @arg {number} id ID of the desired resolution
	 * @returns {this} The request, for chaining
	 */
	setResolution(id) {
		return this.setArgument('id', id);
	}

	/**
	 * @inheritdoc
	 * @returns {Promise<types.WorldAssembly>}
	 */
	async send() {
		this.useFactory(WorldAssembly.create);
		return await super.send();
	}
}

exports.WARequest = WARequest;
