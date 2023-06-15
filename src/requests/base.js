/**
 * @license
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const https = require('node:https');
const {
	IncomingMessage,
	IncomingHttpHeaders
} = require('node:http');

const flow = require('xml-flow');

const { txt } = require('./converter');

/**
 * The mother of all superclasses, being inherited by all specialised request classes.
 * 
 * Holds static properties configurable by the user to en/disable the built-in rate-limiter of
 * ALFoNS and, most importantly, set the user agent for identifying the user to NS admins.
 * 
 * The {@linkcode NSRequest.send()} function is invoked upon execution of any subclass and parses
 * responses from the API via the `xml-flow` package, while the {@linkcode NSRequest.raw()}
 * function can be called alternatively to receive the raw response returned by the API.
 */
class NSRequest {

	/* === General Customisation - Called From api.js Only === */

	/**
	 * The custom text that is set as the `User-Agent` header in requests to the NS API.
	 * @type string
	 * @package
	 * @static
	 */
	static useragent = null;

	/**
	 * Declares whether or not to apply an automatic rate-limit to requests to the NS API.
	 * @type boolean
	 * @default true
	 * @package
	 * @static
	 */
	static useRateLimit = true;


	/* === Request Execution === */

	/**
	 * Describes the current rate-limiting policy of the NationStates API. This gets updated
	 * automatically based on the information in the headers returned from API requests, but is
	 * initially set to allow 50 requests per 30 seconds, which, as of coding, is the actual limit.
	 * @static
	 * @private
	 */
	static #policy = {
		/** Number of milliseconds treated as one time window by the NS API. */
		period: 30000,
		/** Total number of requests that may be made within one time window. */
		amount: 49,	// Leave space for one TG request that might come from the TG queue
		/** Number of requests sent to the API in the current time window. */
		sent: 0,
		/** Number of requests currently waiting for the active time window to expire. */
		queued: 0,
		/** Unix ms timestamp for when the active time window expires. */
		expires: 0,
		/** Number of milliseconds to add to time window calculations as a safety buffer. */
		buffer: 200,
		/** Unix ms timestamp of when a new time window starts, as stated by the API. */
		retry: 0
	}

	/**
	 * Depending on how many requests have been sent to the NS API in the current API window
	 * already, pauses further execution for an appropriate amount of time if `await`ed, so as to
	 * not exceed the API's rate-limit.
	 * @package
	 */
	async ratelimit() {
		let now = Date.now();
		let policy = NSRequest.#policy;

		// If activating a new time window, only save the expiration time and reset the data
		if(now > policy.expires) {
			policy.expires = now + policy.period + policy.buffer;
			policy.sent = 1;
			policy.queued = 0;
			policy.queuedSent = 0;
			return;
		}

		// If there's still room for requests in the current time window, just register the request
		if(policy.sent < policy.amount) {
			policy.sent += 1;
			return;
		}

		/*
		 * If however the maximum number of requests has been reached for the current time window
		 * already, a queue of requests is calculated:
		 * - Firstly, check whether the current length of the queue would take up one more whole
		 *   time window, and if so, register a new expiration date to account for this new window
		 * - Then, wait the time necessary to reach the start of the next non-filled time window
		 * - If there was a rate-limit excess in the meantime and a retry time has been set, repeat
		 *   the above steps (effectively, request is re-queued at the end of the current queue)
		 */
		let windowQueue;
		do {
			windowQueue = policy.queued % policy.amount;
			if(windowQueue === 0) policy.expires += policy.period + policy.buffer;

			policy.queued += 1;
			await timeout(policy.expires - policy.period - now);
			policy.queued -= 1;
		} while (policy.retry > (now = Date.now()))

		// Release only 2 requests per second so the API isn't completely spammed
		policy.sent = policy.sent % policy.amount + 1;
		await timeout(windowQueue * 500);
	}

	/**
	 * Compiles all registered arguments into an `https` request and sends it to the NS API.
	 * If not disabled, also respects the respective rate limits.
	 * @returns {Promise<IncomingMessage>} The raw response from the NS API.
	 */
	async raw() {
		// Verify that a user agent has been set
		if(NSRequest.useragent == null) throw new Error('No user agent set');

		// Prepare request headers
		let headers = {
			'User-Agent': NSRequest.useragent,
			'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
		};

		// If login credentials are provided, add them to the headers
		let c = this.getCredentials?.();
		if(c instanceof NSCredential) {
			if(c.nation != this.getArgument('nation'))
				throw new Error('Provided credentials are for wrong nation');
			if(c.password)	headers['X-Password']	= c.password;
			if(c.autologin)	headers['X-Autologin']	= c.autologin;
			if(c.pin)		headers['X-Pin']		= c.pin;
		}

		// Prepare request body
		let body = this.getBody?.();
		if(body) headers['Content-Length'] = (new TextEncoder().encode(body)).length.toString();

		// Be sure to meet the rate-limit, then send the actual HTTP request via the fetch API
		if(NSRequest.useRateLimit) await this.ratelimit();
		let response = await call('https://www.nationstates.net/cgi-bin/api.cgi', {
			method: 'POST',
			headers: headers
		}, body)
		.catch(() => {	// If there was a problem with sending the request, throw an error
			throw new Error('NS API unreachable');
		});

		// Update ratelimit info from the headers returned
		let policy = response.headers['ratelimit-policy']?.split(';w=');
		if(policy) {
			if(policy[0]) NSRequest.#policy.amount = policy[0];
			if(policy[1]) NSRequest.#policy.period = policy[1] * 1000;
		}

		// If no errors occurred, update authentication data if possible, then return the stream
		if(response.statusCode >= 200 && response.statusCode < 300) {
			let c = this.getCredentials?.();
			if(c instanceof NSCredential) c.updateFromResponse(response.headers);
			return response;
		}

		// Otherwise, interpret the returned status code:
		switch (response.statusCode) {	
		case 403: throw new Error('Login failed');
		case 409: throw new Error('Last non-pin login too recent');
		case 404: throw new Error('Requested entity not found');
		case 429:
			let policy = NSRequest.#policy;
			policy.retry = Date.now() + 
				(response.headers.get('retry-after') || policy.period / 1000)
				* 1000;
			policy.sent = policy.amount;
			throw new Error('Ratelimit exceeded');
		default: throw new Error(`API error: ${response.status} ${response.statusText}`);
		}
	}

	/**
	 * Sends an HTTP request with all data specified in this request instance to the API. Returned
	 * XML is passed to the `xml-flow` module for parsing, listening for tags with the given name
	 * and returning the data within the last of them to close - ideally, the XML's root element.
	 * @param {string} root Name of the XML tag that should be treated as the root element.
	 * @returns The object returned by the XML parser for the given root tag.
	 */
	async send(root) {
		let res = await this.raw();
		if(!res) throw new Error('Unknown error while communicating with the NS API!');

		// Configure the XML reader
		let xml = flow(res, {
			simplifyNodes: false,	// These two are necessary to allow a semi-standardised
			useArrays: flow.ALWAYS,	// creation of response objects without too much hassle.
			lowercase: false		// Also, staying faithful to NS API response formatting :P
		});

		return new Promise((resolve, reject) => {
			// Sometimes there are e.g. child <NATION> tags within a <NATION> root, so just
			// keep track of all of them and only return the last one closed for the end event
			let hits = [];
			xml.on(`tag:${root.toUpperCase()}`, obj => hits.push(obj));
			xml.once('tag:ERROR', obj => reject(txt(obj, '$text')));
			xml.once('error', err => reject(err));
			xml.once('end', () => resolve(hits[hits.length - 1]));
		});
	}
}

/**
 * Superclass for all specialised request subclasses that work with URL parameters in any way.
 * 
 * Holds the user-configurable {@linkcode ParameterRequest.version} property, which is used to
 * request API responses in a specific version of the NS API for compatibility purposes.
 * 
 * Its {@linkcode ParameterRequest.setArgument()}, {@linkcode ParameterRequest.getArgument()},
 * {@linkcode ParameterRequest.removeArgument()}, and {@linkcode ParameterRequest.getArguments()}
 * functions can be used to build custom requests without using any specialised subclass at all.
 */
class ParameterRequest extends NSRequest {
	
	/**
	 * Defines the version of the NS API to request all data in.
	 * @type number
	 * @default 12
	 * @static
	 * @package
	 */
	static version = 12;

	/* === Interna === */

	/**
	 * List of all arguments required by the API to properly process this request.
	 * @type string[]
	 * @private
	 */
	#mandatory = [];

	/**
	 * An object holding all arguments currently registered in this request instance.
	 * The key is the same as the parameter name later in the HTTP request.
	 * @private
	 */
	#argsSet = {};

	/**
	 * Instantiates a new {@linkcode ParameterRequest}. **Intended for internal use only.**
	 * @param  {string[]} required Argument names required later in the HTTP request.
	 * @package
	 */
	constructor(...required) {
		super();
		if(required) this.#mandatory = required;
		if(typeof ParameterRequest.version === 'number')
			this.setArgument('v', ParameterRequest.version);
	}


	/* === Argument Manipulation === */

	/**
	 * Saves the given data under the given argument name for when this request is sent to the API.
	 * @param {string} key Name of the argument data to pass to the API.
	 * @param  {string[]} values Data to pass to the API. Arrays are joined with `+` as separator.
	 * @returns {this} The request, for chaining.
	 */
	setArgument(key, ...values) {
		if(key && values) this.#argsSet[key] = values.join('+');
		return this;
	}

	/**
	 * Gets the argument data that is currently saved in this request under the given name.
	 * @param {string} key Name of the argument.
	 * @returns {string} The data currently saved for that argument.
	 */
	getArgument(key) {
		return this.#argsSet[key];
	}

	/**
	 * Gets a list with the names of all arguments that are currently set within this request.
	 * @returns {string[]} A list of all the arguments currently set.
	 */
	getArguments() {
		return Object.keys(this.#argsSet);
	}

	/**
	 * Removes the data saved under the given argument name from this request.
	 * @param {string} name Name of the argument.
	 * @returns {this} The request, for chaining.
	 */
	removeArgument(name) {
		if (this.getArguments().includes(name)) delete this.#argsSet[name];
		return this;
	}

	/**
	 * Registers the given parameter names to require having a value set for them
	 * before proceeding with request execution.
	 * @param {...string} names Names of the URL parameter to mandate.
	 * @returns {this} The request, for chaining.
	 * @protected
	 */
	mandate(...names) {
		if(names) for(let name of names)
			if(!this.#mandatory.includes(name)) this.#mandatory.push(name);
		return this;
	}

	/**
	 * Formats all parameters set for this request into a URL query string,
	 * directly usable as request body in an API query.
	 * @returns {string} A string of the format `param1=value1&param2=value2&...`
	 */
	getBody() {
		let args = [];
		for(let key of this.getArguments()) args.push(`${key}=${this.getArgument(key)}`);
		return args.join('&');
	}

	/** @inheritdoc */
	async raw() {
		// Verify that all required arguments are set
		if(this.#mandatory.length > 0) {
			let missing = [];
			let saved = this.getArguments();
			for(let arg of this.#mandatory) if(!saved.includes(arg)) missing.push(arg);
			if(missing.length > 0) throw new Error('Request misses mandatory arguments: '
					+ missing.join(', '));
		}
		return await super.raw();
	}
}

/**
 * Superclass for all requests to API endpoints that accept specific shards.
 * 
 * Adds several functions to make setting, adding, selective removing, or complete deletion of
 * single or multiple shards from the request easier than with the {@linkcode ParameterRequest}
 * argument manipulation methods.
 */
class ShardableRequest extends ParameterRequest {
	/**
	 * Defines specific shards to query from the NS API.
	 * @param  {...string} shards Identifiers of the desired shards.
	 * @returns {this} The request, for chaining.
	 */
	shard(...shards) {
		this.setArgument('q', ...shards);
		return this;
	}

	/**
	 * Adds more shards to any already set for this request.
	 * @param  {...any} shards Identifiers of the desired shards.
	 * @returns {this} The request, for chaining.
	 */
	addShards(...shards) {
		this.shard(...[...this.getShards(), ...shards]);
		return this;
	}

	/**
	 * Gets all shards currently registered to be queried with this request.
	 * @returns {string[]} A list with the identifiers of all shards currently set in this request.
	 */
	getShards() {
		return this.getArgument('q')?.split('+') || [];
	}

	/**
	 * Removes all previously set sharding from this request.
	 * @returns {this} The request, for chaining.
	 */
	clearShards() {
		this.removeArgument('q');
		return this;
	}

	/**
	 * Removes the specified shards from those to be queried with this request.
	 * @param  {...string} shards Identifiers of the unwanted shards.
	 * @returns {this} The request, for chaining.
	 */
	removeShards(...shards) {
		let remain = [];
		for(let shard of this.getShards()) if(!shards.includes(shard)) remain.push(shard);
		return this.shard(...remain);
	}
}

/**
 * Helper class for saving login credentials of a nation in a standardized form.
 * 
 * If passed to a request instance that authenticates with the NS API upon execution, the
 * {@linkcode NSCredential.autologin} and {@linkcode NSCredential.pin} properties are updated
 * automatically with the data returned by the API, so ideally there should be only a single
 * credential instance for any one nation for proper recording of the session PIN especially.
 */
class NSCredential {

	/**
	 * Name of the nation the login credentials are for.
	 * @type string
	 */
	nation;

	/**
	 * The nation's password.
	 * @type string
	 */
	password;

	/**
	 * The nation's password in encrypted form, as provided by NationStates.
	 * @type string
	 */
	autologin;

	/**
	 * The login PIN of the current session. Valid until the nation's next login, it logs out, or
	 * is idle for two hours. Updated automatically when executing an authenticated request.
	 * @type number
	 */
	pin;

	constructor(nation, password = undefined, autologin = undefined) {
		if(typeof nation !== 'string') throw new Error(`Invalid nation name (${nation})`);
		if(!password && !autologin) throw new Error('Missing required login information');
		this.nation = nsify(nation);
		this.password = password;
		this.autologin = autologin;
		this.pin = undefined;
	}

	/**
	 * Updates the autologin and PIN data from the provided header data.
	 * @param {IncomingHttpHeaders} responseHeaders HTTP headers returned by the NS API.
	 */
	updateFromResponse(responseHeaders) {
		this.autologin = responseHeaders['x-autologin'] || this.autologin;
		this.pin = responseHeaders['x-pin'] || this.pin;
	}
}


/**
 * Adjusts the given string - usually the name of a nation or region -
 * into a format compatible with calls to the NationStates API.
 * @param {string} name String to adjust.
 * @returns {string | null} The adjusted string, if it was a string, otherwise `null`.
 */
function nsify(name) {
	if(typeof name == 'string') return name.trim().replace(/ /g, '_').toLowerCase();
	else return null;
}

/**
 * Calls the {@linkcode nsify} function on all elements of the supplied
 * array of strings, also mutating the array in the process.
 * @param {string[]} names List to adjust all the elements of.
 * @returns {string[] | null} The given array, or `null` if mutation failed.
 */
function nsifyList(names) {
	try {
		for(let i = 0; i < names.length; i++) names[i] = this.nsify(names[i]);
	} catch (e) {
		return null;
	}
	return names;
}

/**
 * Pauses execution for the specified amount of time if `await`ed.
 * @param {number} period Number of milliseconds to pause.
 * @package
 */
async function timeout(period) {
	return new Promise((resolve, reject) => setTimeout(() => resolve(), Math.max(0, period)));
}

/**
 * Sends an HTTP query to the given URL.
 * @param {string} url URL to query.
 * @param {https.RequestOptions} options Options to further define the query.
 * @param {string} postData Data to write to the request body
 * @returns {Promise<IncomingMessage>} The response from the queried URL.
 */
function call(url, options, postData = null) {
	return new Promise((resolve, reject) => {
		let request = https
			.request(url, options, response => resolve(response))
			.once('error', e => reject(e));
		if(postData && options.method === 'POST') request.write(postData);
		request.end();
	});
}


exports.NSRequest = NSRequest;
exports.ParameterRequest = ParameterRequest;
exports.ShardableRequest = ShardableRequest;
exports.NSCredential = NSCredential;

exports.nsify = nsify;
exports.nsifyList = nsifyList;
exports.call = call;
