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
const dump = require('./requests/dump');

/**
 * The entry point to any NationScript usage.
 * 
 * It contains several functions for changing settings of NationScript:
 * * {@link module:nationscript/api.setAgent setAgent()} for setting the
 *   **mandatory** custom user agent,
 * * {@link module:nationscript/api.setUseRateLimit setUseRateLimit()} for
 *   en-/disabling the built-in rate-limiter of NationScript,
 * * {@link module:nationscript/api.setUseVersion setUseVersion()} to specify a
 *   specific API version to make all calls to,
 * * {@link module:nationscript/api.setTGClientKey setTGClientKey()} to set
 *   the client key to use for TG API requests,
 * * {@link module:nationscript/api.setDumpDirectory setDumpDirectory()} to set
 *   a custom directory to save local Data Dump copies in.
 * 
 * It furthermore provides a variety of functions that return new instances of
 * the request subclass fine-tuned for building queries to the corresponding
 * API endpoint. A basic request instance for more low-level request building
 * can also be instantiated using the
 * {@link module:nationscript/api.custom custom()} function. The specialised
 * instantiation functions are:
 * * For the reading endpoints:
 *     * {@link module:nationscript/api.nation nation()}
 *     * {@link module:nationscript/api.region region()}
 *     * {@link module:nationscript/api.world world()}
 *     * {@link module:nationscript/api.wa wa()}
 *     * {@link module:nationscript/api.cardDetails cardDetails()}
 *     * {@link module:nationscript/api.cards cards()}
 * * For command endpoints:
 *     * {@link module:nationscript/api.issue issue()}
 *     * {@link module:nationscript/api.giftCard giftCard()}
 *     * {@link module:nationscript/api.dispatchAdd dispatchAdd()}
 *     * {@link module:nationscript/api.dispatchEdit dispatchEdit()}
 *     * {@link module:nationscript/api.dispatchRemove dispatchRemove()}
 *     * {@link module:nationscript/api.rmb rmb()}
 * * For the miscellaneous endpoints:
 *     * {@link module:nationscript/api.tg tg()}
 *     * {@link module:nationscript/api.ua ua()}
 *     * {@link module:nationscript/api.v v()}
 * * For querying Data Dumps:
 *     * {@link module:nationscript/api.nationsFromDump nationsFromDump()}
 *     * {@link module:nationscript/api.regionsFromDump regionsFromDump()}
 *     * {@link module:nationscript/api.cardsFromDump cardsFromDump()}
 * @summary Holds methods for NationScript setup and request initialisation.
 * @module nationscript/api
 */

/* === User Setup === */

/**
 * Registers the custom part of the user agent for this script, which will be
 * sent as the `User-Agent` header together with a notice that the request is
 * being made using this library in all HTTP requests to the NS API.
 * 
 * **Setting a UserAgent
 * [is mandatory](https://www.nationstates.net/pages/api.html#terms) per the
 * Terms of Use of the NS API.** As long as it's not deceptive and allows NS
 * staff to contact you in case something goes wrong, there are no specific
 * requirements for it.
 * @arg {string} agent The string to send as user agent.
 */
function setAgent(agent) {
	if (typeof agent === 'string') NSRequest.useragent = agent;
	return this;
}

/**
 * Enables or disables the built-in automatic rate-limiting function of
 * NationScript. Useful if you want to use a custom, slower rate of sending
 * requests, or have other programs making requests to the NS API that aren't
 * run by this NationScript instance. Enabled by default.
 * @arg {boolean} state `true` to use built-in rate-limiter, `false` to
 *     disable it.
 */
function setUseRateLimit(state) {
	if (typeof state === 'boolean') NSRequest.useRateLimit = state;
	return this;
}

/**
 * Registers a custom NS API version to use with all requests. The API supports
 * the two most recent versions; the current version number can be checked via
 * the API itself using
 * [this link](https://www.nationstates.net/cgi-bin/api.cgi?a=version) or a
 * {@link VersionRequest}.
 * @arg {?number} version API version to request the data in; `null` to use the
 *     most recent.
 */
function setUseVersion(version) {
	if (typeof version === 'number' || version === null)
		DataRequest.version = version;
	return this;
}

/**
 * Registers the telegram client key to use for {@link TGRequest}s. Unlike the
 * rest of the NS API, sending TGs requires a special client key issued by 
 *  moderator.
 * @arg {string} key The client key to use.
 */
function setTGClientKey(key) {
	if(typeof key === 'string') TGRequest.client = key;
	return this;
}

/**
 * Registers a custom directory to save and look for local Daily Data Dump
 * copies in.
 * @arg {string} path Path to the desired save directory.
 */
function setDumpDirectory(path) {
	DumpRequest.setDirectory(path);
	return this;
}

/**
 * Register a custom way to determine the file names of local copies of the
 * Nations Daily Data Dump.
 * @arg {dump.FileNamerNormal} fileNamer Function determining the file name,
 *     depending on a given `Date`
 */
function setDumpNameNation(fileNamer) {
	if(typeof fileNamer === 'function') NationDumpRequest.filename = fileNamer;
}

/**
 * Register a custom way to determine the file names of local copies of the
 * Regions Daily Data Dump.
 * @arg {dump.FileNamerNormal} fileNamer Function determining the file name,
 *     depending on a given `Date`
 */
function setDumpNameRegion(fileNamer) {
	if(typeof fileNamer === 'function') RegionDumpRequest.filename = fileNamer;
}

/**
 * Register a custom way to determine the file names of local copies of the
 * Cards Seasonal Data Dump.
 * @arg {dump.FileNamerCard} fileNamer Function determining the file name,
 *     depending on a given season number
 */
function setDumpNameCard(fileNamer) {
	if(typeof fileNamer === 'function') CardDumpRequest.filename = fileNamer;
}

exports.setAgent = setAgent;
exports.setUseRateLimit = setUseRateLimit;
exports.setUseVersion = setUseVersion;
exports.setTGClientKey = setTGClientKey;
exports.setDumpDirectory = setDumpDirectory;
exports.setDumpNameNation = setDumpNameNation;
exports.setDumpNameRegion = setDumpNameRegion;
exports.setDumpNameCard = setDumpNameCard;


/* === Basic Requests === */

/**
 * Request data about a single nation from the API!
 * @arg {string} name Name of the nation to request data on
 * @returns {NationRequest}
 */
function nation(name) {
	return new NationRequest(name);
}

/**
 * Request data about a single region from the API!
 * @arg {string} name Name of the region to request data on
 * @returns {RegionRequest}
 */
function region(name) {
	return new RegionRequest(name);
}

/**
 * Request data about the wider game world from the API!
 * @returns {WorldRequest}
 */
function world() {
	return new WorldRequest();
}

/**
 * Request data about the World Assembly from the API!
 * @arg {number} council ID of the WA council the data should be about
 * @returns {WARequest}
 * @see {@link WACouncil} for valid council IDs.
 */
function wa(council) {
	return new WARequest(council);
}

/**
 * Request data about the wider world of trading cards from the API!
 * @returns {CardWorldRequest}
 */
function cards() {
	return new CardWorldRequest();
}

/**
 * Request data about an individual trading card from the API!
 * @arg {number} cardID ID of the desired card
 * @arg {number} season Number of the season the desired card was inscribed for
 * @returns {CardIndividualRequest}
 */
function cardDetails(cardID, season) {
	return new CardIndividualRequest()
		.setCard(cardID, season);
}

exports.nation = nation;
exports.region = region;
exports.world = world;
exports.wa = wa;
exports.cards = cards;
exports.cardDetails = cardDetails;


/* === Private Commands === */

/**
 * Have a nation address the specified issue!
 * @arg {number} id ID of the issue to address
 * @arg {number} option (Issue-internal) ID of the option to choose for the
 *     issue; `-1` to dismiss
 * @returns {IssueCommand}
 */
function issue(id, option = -1) {
	return new IssueCommand()
		.setIssue(id)
		.setOption(option);
}

/**
 * Have a nation publish a new dispatch!
 * @arg {NSCredential} credentials Login credentials for the nation
 * @returns {DispatchAddCommand}
 */
function dispatchAdd(credentials) {
	return new DispatchAddCommand()
		.authenticate(credentials);
}

/**
 * Have a nation delete one of its existing dispatches!
 * @arg {NSCredential} credentials Login credentials for the nation
 * @returns {DispatchDeleteCommand}
 */
function dispatchRemove(credentials) {
	return new DispatchDeleteCommand()
		.authenticate(credentials);
}

/**
 * Have a nation edit one of its existing dispatches!
 * @arg {NSCredential} credentials Login credentials for the nation
 * @returns {DispatchEditCommand}
 */
function dispatchEdit(credentials) {
	return new DispatchEditCommand()
		.authenticate(credentials);
}

/**
 * Have a nation gift a trading card to another nation!
 * @arg {string} recipient Nation that should receive the card
 * @arg {NSCredential} credentials Login credentials for the gifting nation
 * @returns {GiftCardCommand}
 */
function giftCard(recipient, credentials) {
	return new GiftCardCommand()
		.authenticate(credentials)
		.setRecipient(recipient);
}

/**
 * Have a nation lodge a message to the Regional Message Board of a region!
 * @arg {string} region Region to whose RMB the message should be lodged
 * @arg {string} message Body text of the message to lodge
 * @arg {NSCredential} credentials Login credentials for the nation
 * @returns {RMBPostCommand}
 */
function rmb(region, message, credentials) {
	return new RMBPostCommand()
		.authenticate(credentials)
		.setRegion(region)
		.setText(message);
}

exports.issue = issue;
exports.dispatchAdd = dispatchAdd;
exports.dispatchEdit = dispatchEdit;
exports.dispatchRemove = dispatchRemove;
exports.giftCard = giftCard;
exports.rmb = rmb;


/* === Miscellaneous Requests === */

/**
 * Send a telegram to the specified nation!
 * @arg {string} recipient Name of the nation that should receive the telegram
 * @returns {TGRequest}
 */
function tg(recipient) {
	return new TGRequest()
		.setRecipient(recipient);
}

/**
 * Check how the user agent you set appears to the NS API!
 * @returns {UserAgentRequest}
 */
function ua() {
	return new UserAgentRequest();
}

/**
 * Check the current version of the NS API!
 * @returns {VersionRequest}
 */
function v() {
	return new VersionRequest();
}

/**
 * Build a request to the NS API completely from scratch!
 * @returns {DataRequest}
 */
function custom() {
	return new DataRequest();
}

exports.tg = tg;
exports.ua = ua;
exports.v = v;
exports.custom = custom;


/* === Daily Data Dumps === */

/**
 * Get data on a large number of nations using the nations Daily Data Dump!
 * @arg {number} mode {@link DumpMode} to use
 * @arg {Date} date Date of the desired Dump ;defaults to the most recent one
 * @returns {NationDumpRequest}
 */
function nationsFromDump(mode, date = new Date()) {
	return new NationDumpRequest(date)
		.setMode(mode);
}

/**
 * Get data on a large number of regions using the regions Daily Data Dump!
 * @arg {number} mode {@link DumpMode} to use
 * @arg {Date} date Date of the desired Dump; defaults to the most recent one
 * @returns {RegionDumpRequest}
 */
function regionsFromDump(mode, date = new Date()) {
	return new RegionDumpRequest(date)
		.setMode(mode);
}

/**
 * Get data on a large number of trading cards using the cards Data Dump!
 * @arg {number} mode {@link DumpMode} to use
 * @arg {number} season ID of the desired trading cards season; defaults to `3`
 * @returns {CardDumpRequest}
 */
function cardsFromDump(mode, season = 3) {
	return new CardDumpRequest(season)
		.setMode(mode);
}

exports.nationsFromDump = nationsFromDump;
exports.regionsFromDump = regionsFromDump;
exports.cardsFromDump = cardsFromDump;
