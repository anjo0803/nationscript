/**
 * The miscellaneous request module contains functionality for API endpoints that don't really fit
 * into any of the other specialised request modules, namely the telegrams endpoint as well as the
 * checking functionalities for `User-Agent`s and the current API version.
 * @module requests/misc
 * @license {@linkplain https://mozilla.org/MPL/2.0/ MPL-2.0}
 */

const {
	ParameterRequest,
	nsify
} = require('./base');

/**
 * @summary Request subclass for building requests to the telegrams API.
 */
class TGRequest extends ParameterRequest {

	/**
	 * The TG client key to use when executing telegram requests.
	 * @type string
	 * @package
	 */
	static client;

	/**
	 * Declares whether the TG being sent by this request is a recruitment telegram.
	 */
	recruitment = false;

	constructor(recipient) {
		super('a', 'client', 'tgid', 'key', 'to');
		this.setArgument('a', 'sendTG')
			.setArgument('client', client)
			.setArgument('to', nsify(recipient));
	}

	/**
	 * Describes the current special rate-limiting policy of the NationStates API for requests
	 * to the telegrams endpoint.
	 */
	static #policy = {
		recruitment: 180000,
		standard: 30000,
		last: 0
	}

	/**
	 * Depending on when the last request was sent to the telegram endpoint, pauses further
	 * execution for an appropriate amount of time if `await`ed, so as to not exceed the TG API's
	 * special rate-limit.
	 * @override
	 * @private
	 */
	async ratelimit() {
		let now = Date.now();
		let policy = TGRequest.#policy;

		// The TG API works slightly differently, in that it is not a flush bucket system like the
		// general API, but simply checks whether sufficient time has passed since the last request
		let wait = policy.last + (this.recruitment ? policy.recruitment : policy.standard) - now;
		policy.last = now + 200;
		if (wait > 0) await this.timeout(wait);
	}

	/**
	 * Sets the details of the telegram that should be sent.
	 * @param {number} id ID of the telegram.
	 * @param {string} secret Secret Key of the telegram.
	 */
	setTelegram(id, secret) {
		return this
			.setArgument('tgid', id)
			.setArgument('key', secret);
	}

	/**
	 * Declares whether the telegram that is to be sent by executing this request is a recruitment
	 * TG or a regular TG. By default, it's declared a regular TG.
	 * @param {boolean} is `true` to declare a recruitment TG, `false` to declare a regular TG.
	 * @returns {this} The request, for chaining.
	 */
	setIsRecruitment(is) {
		if(typeof is === 'boolean') this.recruitment = is;
	}

	/**
	 * Sends an HTTP request with all data specified in this request
	 * instance to the API and interprets its response.
	 * @returns {Promise<boolean>} `true` if sent successfully, otherwise `false`.
	 */
	async send() {
		let res = (await streamToString(await this.raw())).toString().trim();
		if(res == 'queued') return true;	// The TG API only returns a plaintext 'queued'
		else return false;
	}
}

/**
 * Request subclass for making a request to the user agent endpoint of the NS API.
 */
class UserAgentRequest extends ParameterRequest {
	constructor() {
		super('a');
		this.setArgument('a', 'useragent');
	}

	/**
	 * Sends the data in this request instance to the API and returns its response.
	 * @returns {Promise<string>} The content of the `User-Agent` header as visible to the API.
	 */
	async send() {
		return (await streamToString(await this.raw()))?.substring(19)?.replace(/\n$/g, '');
	}
}

/**
 * Request subclass for making a request to the version endpoint of the NS API.
 */
class VersionRequest extends ParameterRequest {
	constructor() {
		super('a');
		this.setArgument('a', 'version');
	}

	/**
	 * Sends the data in this request instance to the API and returns its response.
	 * @returns {Promise<number>} The current version of the API.
	 */
	async send() {
		return parseInt(await streamToString(await this.raw()));
	}
}

// https://stackoverflow.com/questions/10623798
function streamToString(stream) {
	let ret = [];
	return new Promise((resolve, reject) => {
		stream.on('data', data => ret.push(Buffer.from(data)));
		stream.on('error', e => reject(e));
		stream.on('end', () => resolve(Buffer.concat(ret).toString('utf-8')));
	});
}

exports.TGRequest = TGRequest;
exports.UserAgentRequest = UserAgentRequest;
exports.VersionRequest = VersionRequest;
