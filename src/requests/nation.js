/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Internal module providing a specialised request builder class for fetching
 * data from the Nations API.
 * @module nationscript/requests/nation
 */

const {
	ShardableRequest,
	NSCredential,
	toIDForm
} = require('./base');
const {
	NationShard,
	NationPrivateShard
} = require('../shards');
const {
	CensusMode,
	CensusScale
} = require('../enums');
const types = require('../types');

const Nation = require('../type/nation');

/**
 * Request subclass for building requests to the nations endpoint of the API.
 * 
 * Stores the login credential and ensures it is sent together with the request
 * and the {@link NSCredential#pin pin} stays up-to-date.
 */
class NationRequest extends ShardableRequest {
	/**
	 * @arg {string} nation Name of the nation to request data on
	 */
	constructor(nation) {
		super();
		this.mandate('nation')
			.setArgument('nation', toIDForm(nation));
	}

	/**
	 * Login credential for the requested nation.
	 * @type {?NSCredential}
	 * @private
	 */
	credential = null;

	/**
	 * Provide a login credential for the nation in order to be able to request
	 * {@link NationPrivateShard}s.
	 * @arg {NSCredential} credential Login credential to use
	 * @returns {this} The request, for chaining
	 */
	authenticate(credential) {
		if(!(credential instanceof NSCredential))
			throw TypeError('Invalid credential: ' + credential);

		if(credential.password)
			this.setHeader('X-Password', credential.password);
		if(credential.autologin)
			this.setHeader('X-Autologin', credential.autologin);
		if(credential.pin)
			this.setHeader('X-Pin', credential.pin);

		this.credential = credential;
		return this;
	}

	/**
	 * Set a hypothetical sender region. Affects requests containing the
	 * {@link NationShard.TG_RECRUITABLE} or
	 * {@link NationShard.TG_CAMPAIGNABLE} shards.
	 * 
	 * *Note that the NS API uses the same argument name for the sender, the
	 * starting timestamp for queries of the {@link NationShard.CENSUS} shard
	 * (in history mode), and the display timestamp for the
	 * {@link NationPrivateShard.NOTICES} shard, and it thus is impossible to
	 * use this function without removing data set for one of those in this
	 * request instance.*
	 * @arg {string} sender Name of the theoretical sender region
	 * @returns {this} The request, for chaining
	 */
	setTGSender(sender) {
		return this.setArgument('from', toIDForm(sender));
	}

	/**
	 * Define one or more {@link CensusScale}s to query. Only affects requests
	 * containing the {@link NationShard.CENSUS} shard. If this is not set, the
	 * API uses the day's featured scale.
	 * @arg {...number} scales IDs of the census scales to request; `null` to
	 *     request all
	 * @returns {this} The request, for chaining
	 */
	setCensusScale(...scales) {
		if(scales) return this.setArgument('scale', ...scales);
		return this.setArgument('scale', 'all');
	}

	/**
	 * Set one or more modes to request the World Census scale data in. Only
	 * affects requests containing the {@link NationShard.CENSUS} shard. If
	 * custom modes are not requested, the API uses {@link CensusMode.SCORE},
	 * {@link CensusMode.RANK_REGION}, and {@link CensusMode.RANK_WORLD}.
	 * @arg  {...string} modes {@link CensusMode}(s) to use
	 * @returns {this} The request, for chaining
	 */
	setCensusMode(...modes) {
		return this.setArgument('mode', ...modes);
	}

	/**
	 * Set the {@link CensusMode} to history mode to query historical census
	 * scores. Affects requests containing the {@link NationShard.CENSUS}
	 * shard. Modes previously set via {@link NationRequest#setCensusMode} are
	 * overwritten, since history mode cannot be combined with other modes.
	 * 
	 * *Note that the NS API uses the same argument name for the starting
	 * timestamp, the TG sender for the {@link NationShard.TG_RECRUITABLE} and
	 * {@link NationShard.TG_CAMPAIGNABLE}, and the display timestamp for the
	 * {@link NationPrivateShard.NOTICES} shards, and it thus is impossible to
	 * use this function without removing data set for one of those in this
	 * request instance.*
	 * @arg {?number} from Timestamp from which on to request the data; `null`
	 *     to request from the earliest available data point onwards
	 * @arg {?number} to Timestamp up to which to request the data; `null` to
	 *     request up to the most recent available data point
	 * @returns {this} The request, for chaining
	 */
	setHistoryMode(from, to) {
		return this
			.setCensusMode('history')
			.setArgument('from', from)
			.setArgument('to', to);
	}

	/**
	 * Set the timestamp from which on to display notices. Affects requests
	 * containing the {@link NationPrivateShard.NOTICES} shard.
	 * 
	 * *Note that the NS API uses the same argument name for this timestamp,
	 * the telegram sender for the {@link NationShard.TG_RECRUITABLE} and
	 * {@link NationShard.TG_CAMPAIGNABLE} shards, and the starting timestamp
	 * for queries of the {@link NationShard.CENSUS} shard, and it thus is
	 * impossible to use this function without removing data set for one of
	 * those in this request instance.*
	 * @arg {number} from Timestamp from which on to display notices
	 * @returns {this} The request, for chaining
	 */
	setDisplayNotices(from) {
		return this.setArgument('from', from);
	}

	/**
	 * Add a request to the nation login verification endpoint to this request
	 * instance.
	 * @arg {string} checksum The
	 *     [checksum](https://www.nationstates.net/page=verify_login)
	 * @arg {?string} token Custom token for the verification process, or
	 *     `null` if none is used
	 * @returns {this} The request, for chaining
	 */
	verify(checksum, token = null) {
		return this
			.setArgument('a', 'verify')
			.setArgument('checksum', checksum)
			.setArgument('token', token);
	}

	/**
	 * For a stored {@link CommandRequest#credential credential}, the
	 * {@link NSCredential#updateFromResponse} method is invoked with the
	 * received response headers.
	 * @inheritdoc
	 */
	async raw() {
		let ret = await super.raw();
		this.credential?.updateFromResponse(ret.headers);
		return ret;
	}

	/**
	 * @inheritdoc
	 * @returns {Promise<types.Nation>}
	 */
	async send() {
		this.useFactory(Nation.create(this.getShards()));

		/* 
		 * If this request contains a verification request and does not query
		 * shards alongside, the API only returns a simple "1" or "0" to
		 * represent the result of the verification. In that case, the nation
		 * factory will have produced "1" or "0" as its product also.
		 */
		let ret = await super.send();
		if(typeof ret === 'object') return ret;
		return {
			idForm: this.getArgument('nation'),
			verified: ret == 1
		};
	}
}

exports.NationRequest = NationRequest;
