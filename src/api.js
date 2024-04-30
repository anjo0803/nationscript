/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSRequest,
	NSCredential,
	DataRequest
} = require('./requests/base');
const {
	CardIndividualRequest,
	CardWorldRequest
} = require('./requests/card');
const { NationRequest } = require('./requests/nation');
const { RegionRequest } = require('./requests/region');
const { WorldRequest } = require('./requests/world');
const { WARequest } = require('./requests/wa');
const {
	IssueCommand,
	RMBPostCommand,
	DispatchAddCommand,
	DispatchDeleteCommand,
	DispatchEditCommand,
	GiftCardCommand
} = require('./requests/command');
const {
	TGRequest,
	UserAgentRequest,
	VersionRequest
} = require('./requests/misc');
const { WACouncil } = require('./enums');
const {
	DumpRequest,
	NationDumpRequest,
	RegionDumpRequest,
	CardDumpRequest
} = require('./requests/dump');
const { NSError } = require('./errors');

/**
 * The `NS` class is the entry point to any NationScript usage.
 * 
 * It contains several functions for changing settings of NationScript:
 * * {@linkcode NS.setAgent()} for setting the - **mandatory** - custom user agent,
 * * {@linkcode NS.setUseRateLimit()} for en-/disabling the built-in rate-limiter of NationScript,
 * * {@linkcode NS.setUseVersion()} to specify a specific API version to make all calls to,
 * * {@linkcode NS.setTGClientKey()} to register the client key to use for TG API requests,
 * * {@linkcode NS.setDumpDirectory()} to set a custom directory to save local Data Dump copies in.
 * 
 * It furthermore provides a variety of functions that return new instances of the request subclass
 * fine-tuned for building queries to the corresponding API endpoint. A basic request instance for
 * more low-level request building can also be instantiated using the {@linkcode NS.custom()}
 * function. The special instantiation functions are:
 * * For the reading endpoints:
 *     * {@linkcode NS.nation()}
 *     * {@linkcode NS.region()}
 *     * {@linkcode NS.world()}
 *     * {@linkcode NS.wa()}
 *     * {@linkcode NS.cardDetails()}
 *     * {@linkcode NS.cards()}
 *     * {@linkcode NS.nation()}
 * * For command endpoints:
 *     * {@linkcode NS.issue()}
 *     * {@linkcode NS.giftCard()}
 *     * {@linkcode NS.dispatchAdd()}
 *     * {@linkcode NS.dispatchEdit()}
 *     * {@linkcode NS.dispatchRemove()}
 *     * {@linkcode NS.rmb()}
 * * For the miscellaneous endpoints:
 *     * {@linkcode NS.tg()}
 *     * {@linkcode NS.ua()}
 *     * {@linkcode NS.v()}
 * * For querying Data Dumps:
 *     * {@linkcode NS.nationsFromDump()}
 *     * {@linkcode NS.regionsFromDump()}
 *     * {@linkcode NS.cardsFromDump()}
 * @summary Static class used for initialising new request objects for individual NS API endpoints.
 * @hideconstructor
 */
class NS {

	/* === User Setup === */

	/**
	 * Registers the custom part of the user agent for this script, which will be sent as the
	 * `User-Agent` header together with a notice that the request is being made using this library
	 * in all HTTP requests to the NS API.
	 * 
	 * **Setting a UserAgent [is mandatory](https://www.nationstates.net/pages/api.html#terms) per
	 * the Terms of Use of the NS API.** As long as it's not deceptive and allows NS staff to
	 * contact you in case something goes wrong, there are no specific requirements for it.
	 * @param {string} agent The string to send as user agent.
	 */
	static setAgent(agent) {
		if (typeof agent === 'string') NSRequest.useragent = agent
			+ ' (using NationScript v1.0.8 by Tepertopia)';
		return this;
	}

	/**
	 * Enables or disables the built-in automatic rate-limiting function of NationScript. Useful if
	 * you want to use a custom, slower rate of sending requests, or have other programs making
	 * requests to the NS API that aren't run by this NationScript instance. Enabled by default.
	 * @param {boolean} state `true` to use built-in rate-limiting, `false` to disable it.
	 */
	static setUseRateLimit(state) {
		if (typeof state === 'boolean') NSRequest.useRateLimit = state;
		return this;
	}

	/**
	 * Registers a custom NS API version to use with all requests. The API supports the two most
	 * recent versions; the current version number can be checked via the API itself using
	 * [this link](https://www.nationstates.net/cgi-bin/api.cgi?a=version).
	 * @param {string} version API version to request the data in; `null` to use the most recent.
	 */
	static setUseVersion(version) {
		if (typeof version === 'string' || version === null) DataRequest.version = version;
		return this;
	}

	/**
	 * Registers the telegram client key to use for {@linkcode TGRequest}s. Unlike the rest of the
	 * NS API, sending TGs requires a special client key issued by a moderator.
	 * @param {string} key The client key to use.
	 */
	static setTGClientKey(key) {
		if(typeof key === 'string') TGRequest.client = key;
		return this;
	}

	/**
	 * Registers a custom directory to save and look for local Daily Data Dump copies in.
	 * @param {string} path Path to the desired save directory.
	 */
	static setDumpDirectory(path) {
		DumpRequest.setDirectory(path);
		return this;
	}


	/* === Basic Requests === */

	/**
	 * Request data about a single nation from the API!
	 * @param {string} name Name of the nation to request data on.
	 * @returns {NationRequest} A request instance with functions for further customisation.
	 */
	static nation(name) {
		return new NationRequest(name);
	}

	/**
	 * Request data about a single region from the API!
	 * @param {string} name Name of the region to request data on.
	 * @returns {RegionRequest} A request instance with functions for further customisation.
	 */
	static region(name) {
		return new RegionRequest(name);
	}

	/**
	 * Request data about the wider game world from the API!
	 * @returns {WorldRequest} A request instance with functions for further customisation.
	 */
	static world() {
		return new WorldRequest();
	}

	/**
	 * Request data about the World Assembly from the API!
	 * @param {number} council ID of the WA council the data should be about.
	 * @returns {WARequest} A request instance with functions for further customisation.
	 * @see {@linkcode WACouncil} for valid council IDs.
	 */
	static wa(council) {
		return new WARequest(council);
	}

	/**
	 * Request data about the wider world of trading cards from the API!
	 * @returns {CardWorldRequest} A request instance with functions for further customisation.
	 */
	static cards() {
		return new CardWorldRequest();
	}

	/**
	 * Request data about an individual trading card from the API!
	 * @param {number} cardID ID of the desired card; equal to the depicted nation's database ID.
	 * @param {number} season Number of the season the desired card was inscribed for.
	 * @returns {CardIndividualRequest} Request instance with functions for further customisation.
	 */
	static cardDetails(cardID, season) {
		return new CardIndividualRequest(cardID, season);
	}


	/* === Private Commands === */

	/**
	 * Have a nation address the specified issue!
	 * @arg {number} id ID of the issue to address
	 * @arg {number} option (Issue-internal) ID of the option to choose for the
	 *     issue; `-1` to dismiss
	 * @returns {IssueCommand} A request instance with functions for customisation.
	 */
	static issue(id, option = -1) {
		return new IssueCommand()
			.setIssue(id)
			.setOption(option);
	}

	/**
	 * Have a nation publish a new dispatch!
	 * @param {NSCredential} credentials Login credentials for the nation.
	 * @returns {DispatchAddCommand} A request instance with functions for customisation.
	 */
	static dispatchAdd(credentials) {
		return new DispatchAddCommand()
			.authenticate(credentials);
	}

	/**
	 * Have a nation delete one of its existing dispatches!
	 * @param {NSCredential} credentials Login credentials for the nation.
	 * @returns {DispatchDeleteCommand} A request instance with functions for customisation.
	 */
	static dispatchRemove(credentials) {
		return new DispatchDeleteCommand()
			.authenticate(credentials);
	}

	/**
	 * Have a nation edit one of its existing dispatches!
	 * @param {NSCredential} credentials Login credentials for the nation.
	 * @returns {DispatchEditCommand} A request instance with functions for customisation.
	 */
	static dispatchEdit(credentials) {
		return new DispatchEditCommand()
			.authenticate(credentials);
	}

	/**
	 * Have a nation gift a trading card to another nation!
	 * @param {string} recipient Name of the nation that should receive the card.
	 * @param {NSCredential} credentials Login credentials for the gifting nation.
	 * @returns {GiftCardCommand} A request instance with functions for customisation.
	 */
	static giftCard(recipient, credentials) {
		return new GiftCardCommand()
			.authenticate(credentials)
			.setRecipient(recipient);
	}

	/**
	 * Have a nation lodge a message to the Regional Message Board of a region!
	 * @param {string} region Name of the region to whose RMB the message should be lodged.
	 * @param {string} message Body text of the message to lodge.
	 * @param {NSCredential} credentials Login credentials for the nation.
	 * @returns {RMBPostCommand} A request instance ready for execution.
	 */
	static rmb(region, message, credentials) {
		return new RMBPostCommand()
			.authenticate(credentials)
			.setRegion(region)
			.setText(message);
	}


	/* === Miscellaneous Requests === */

	/**
	 * Send a telegram to the specified nation!
	 * @param {string} recipient Name of the nation that should receive the telegram.
	 * @returns {TGRequest} A request instance with functions for customisation.
	 */
	static tg(recipient) {
		return new TGRequest(recipient);
	}

	/**
	 * Check how the user agent you set appears to the NS API!
	 * @returns {UserAgentRequest} A request instance ready for execution.
	 */
	static ua() {
		return new UserAgentRequest();
	}

	/**
	 * Check the current version of the NS API!
	 * @returns {VersionRequest} A request instance ready for execution.
	 */
	static v() {
		return new VersionRequest();
	}

	/**
	 * Build a request to the NS API completely from scratch!
	 * @returns {DataRequest} A request instance ready for customisation.
	 */
	static custom() {
		return new DataRequest();
	}


	/* === Daily Data Dumps === */

	/**
	 * Get data on a large number of nations using the nations Daily Data Dump!
	 * @param {number} mode {@linkcode DumpMode} to use.
	 * @param {Date} date Date of the desired Dump. Defaults to the most recent one.
	 * @returns {NationDumpRequest} Request instance ready for execution.
	 */
	static nationsFromDump(mode, date = new Date()) {
		return new NationDumpRequest(date)
			.setMode(mode);
	}

	/**
	 * Get data on a large number of regions using the regions Daily Data Dump!
	 * @param {number} mode {@linkcode DumpMode} to use.
	 * @param {Date} date Date of the desired Dump. Defaults to the most recent one.
	 * @returns {RegionDumpRequest} Request instance ready for execution.
	 */
	static regionsFromDump(mode, date = new Date()) {
		return new RegionDumpRequest(date)
			.setMode(mode);
	}

	/**
	 * Get data on a large number of trading cards using the cards Data Dump!
	 * @param {number} mode {@linkcode DumpMode} to use.
	 * @param {number} season ID of the desired trading cards season. Defaults to `3`.
	 * @returns {CardDumpRequest} Request instance ready for execution.
	 */
	static cardsFromDump(mode, season = 3) {
		return new CardDumpRequest(season)
			.setMode(mode);
	}
}

exports.NS = NS;
