/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Internal module providing specialised request builder classes for addressing
 * various API endpoints that don't fit under any other module.
 * @module nationscript/requests/misc
 */

const { IncomingMessage } = require('node:http');

const { NSError } = require('../errors');
const {
	NSRequest,
	DataRequest,
	toIDForm
} = require('./base');
const RateLimit = require('./ratelimit');

/**
 * Request subclass for building requests to the telegrams API.
 */
class TGRequest extends DataRequest {

	/**
	 * The TG client key to use when executing telegram requests.
	 * @type {string}
	 * @package
	 */
	static client;

	/**
	 * Declares whether the TG being sent via this request is a recruitment
	 * telegram.
	 * @type {boolean}
	 * @default false
	 */
	recruitment = false;

	/**
	 * Additionally {@link DataRequest#mandate mandate}s the `a`, tgid`, `key`,
	 * `to`, and `client` arguments and sets the `a` and `client` arguments.
	 */
	constructor() {
		super();
		this.mandate('a', 'client', 'tgid', 'key', 'to')
			.setArgument('a', 'sendTG')
			.setArgument('client', TGRequest.client);
	}

	/**
	 * Register the nation that should receive the telegram.
	 * @arg {string} recipient Nation to send the telegram to
	 * @returns {this} The request, for chaining
	 */
	setRecipient(recipient) {
		return this.setArgument('to', toIDForm(recipient));
	}

	/**
	 * Sets the details of the telegram that should be sent.
	 * @arg {number} id Telegram ID
	 * @arg {string} secret Secret Key of the telegram
	 */
	setTelegram(id, secret) {
		return this
			.setArgument('tgid', id)
			.setArgument('key', secret);
	}

	/**
	 * Adjust whether the telegram to be sent by this request is a recruitment
	 * telegram. By default, a non-recruitment telegram is assumed.
	 * @arg {boolean} is `true` to declare a recruitment telegram, `false` to
	 *     declare a regular one
	 * @returns {this} The request, for chaining
	 */
	setIsRecruitment(is) {
		if(typeof is === 'boolean') this.recruitment = is;
		return this;
	}

	/** @inheritdoc */
	async raw() {
		if(NSRequest.useRateLimit) await RateLimit.enforceTG(this.recruitment);
		return await super.raw();
	}

	/**
	 * Calls the {@link TGRequest#raw raw} function and passes the returned
	 * response stream through the {@link streamToString} function.
	 * @returns {Promise<boolean>} `true` if the TG was sent, otherwise `false`
	 * @override
	 */
	async send() {
		let res = (await streamToString(await this.raw())).toString().trim();
		if(res == 'queued') return true;
		else return false;
	}
}

/**
 * Request subclass for making requests to the user agent endpoint of the API.
 */
class UserAgentRequest extends DataRequest {
	/**
	 * {@link DataRequest#mandate mandate}s the `a` argument and sets it.
	 */
	constructor() {
		super();
		this.mandate('a')
			.setArgument('a', 'useragent');
	}

	/**
	 * Calls the {@link NSRequest#raw raw} function and passes its return value
	 * through the {@link streamToString} function, cutting the introductory
	 * part of the API's text response before returning it.
	 * @returns {Promise<string>} The `User-Agent` header as visible to the API
	 * @override
	 */
	async send() {
		let res = await streamToString(await this.raw());
		if(typeof res !== 'string') throw new NSError('Invalid API response');

		// The API response leads with some uninteresting text and trails an
		// excess newline, so that is cut before returning the response
		return res.substring('Your UserAgent is: '.length).replace(/\n$/g, '');
	}
}

/**
 * Request subclass for making requests to the version endpoint of the API.
 */
class VersionRequest extends DataRequest {
	/**
	 * {@link DataRequest#mandate mandate}s the `a` argument and sets it.
	 */
	constructor() {
		super();
		this.mandate('a')
			.setArgument('a', 'version');
	}

	/**
	 * Calls the {@link NSRequest#raw raw} function and passes its return value
	 * through the {@link streamToString} function, converting the text
	 * response to a simple number before returning that.
	 * @returns {Promise<number>} The current version of the API
	 * @override
	 */
	async send() {
		return parseInt(await streamToString(await this.raw()));
	}
}

/**
 * Reads the given streamed response, recording its contents as text and
 * returning it once the stream ends.
 * @arg {IncomingMessage} stream API response to parse
 * @returns {Promise<string>} Text data received from the stream
 * @see https://stackoverflow.com/questions/10623798
 */
function streamToString(stream) {
	let ret = [];
	return new Promise((resolve, reject) => {
		stream.on('data', (data) => ret.push(Buffer.from(data)));
		stream.on('error', (e) => reject(e));
		stream.on('end', () => resolve(Buffer.concat(ret).toString('utf-8')));
	});
}

exports.TGRequest = TGRequest;
exports.VersionRequest = VersionRequest;
exports.UserAgentRequest = UserAgentRequest;
