/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { IncomingMessage } = require('node:http');
const https = require('node:https');

const Parser = require('node-xml-stream-parser');

const {
	NSError,
	APIError,
	EntityNotFoundError,
	LoginError,
	RatelimitError,
	DumpNotModifiedError
} = require('../errors');
const RateLimit = require('./ratelimit');
const {
	NSFactory,
	ArrayFactory
} = require('../factory');

/**
 * The mother of superclasses, inherited by all specialised request classes.
 * 
 * Holds static properties configurable by the user to en/disable the built-in rate-limiter of
 * NationScript and, most importantly, set the user agent for identifying the user to NS admins.
 * 
 * The {@linkcode NSRequest.send()} function is invoked upon execution of any subclass and parses
 * responses from the API via the `xml-flow` package, while the {@linkcode NSRequest.raw()}
 * function can be called alternatively to receive the raw response returned by the API.
 */
class NSRequest {

	/* === General Customisation - Called From api.js Only === */

	/**
	 * The custom text that is set as the `User-Agent` header in requests to the NS API.
	 * @type {?string}
	 * @package
	 */
	static useragent = null;

	/**
	 * Declares whether or not to apply an automatic rate-limit to requests to the NS API.
	 * @type {boolean}
	 * @default true
	 * @package
	 */
	static useRateLimit = true;


	/* === Request preparation === */

	/**
	 * Declares the URL to address with this request.
	 * @type {string}
	 * @private
	 * @default
	 */
	targetURL = 'https://www.nationstates.net/cgi-bin/api.cgi';

	/**
	 * Configures this request to be sent to the given URL.
	 * @param {string} url URL to target.
	 * @returns {this} The request, for chaining.
	 * @public
	 */
	setTargetURL(url) {
		if(typeof url !== 'string')
			throw new TypeError('Invalid target URL: ' + url);
		this.targetURL = url;
		return this;
	}

	/**
	 * Additional headers to send with this request.
	 * @type {import('node:http').OutgoingHttpHeaders}
	 * @private
	 */
	headers = {};

	/**
	 * Registeres the given value to be sent under the given header name when
	 * this request is executed.
	 * @arg {string} name Header name
	 * @arg {string} value Header value
	 * @returns {this} The request, for chaining.
	 * @public
	 */
	setHeader(name, value) {
		if(typeof name !== 'string')
			throw new TypeError('Invalid header key: ' + name);
		if(typeof value !== 'string')
			throw new TypeError('Invalid header value: ' + value);
		this.headers[name] = value;
		return this;
	}

	/**
	 * Removes any prepared header with the given name.
	 * @arg {string} name Header name
	 * @returns {this} The request, for chaining.
	 * @public
	 */
	removeHeader(name) {
		delete this.headers[name];
		return this;
	}

	/**
	 * Data registered to be sent as this request's body. If it is empty upon
	 * request execution, the request will be sent as a `GET` request, without
	 * a request body. Subclasses offer methods for altering this data.
	 * @type {Object.<string, string>}
	 * @protected
	 */
	body = {};

	/**
	 * Formats the {@link NSRequest#body body} into a query string, as required
	 * by the NationStates API for the request body.
	 * @returns {string} A string of the format `key1=value1&key2=value2&...`
	 */
	getData() {
		let args = [];
		for(let key in this.body) args.push(`${key}=${this.body[key]}`);
		return args.join('&');
	}

	/* === Request Execution === */

	/**
	 * 
	 * @returns {NSRequestData}
	 * @private
	 */
	createRequestData() {
		if(NSRequest.useragent == null) throw new NSError('Missing UserAgent');

		// Create the request body from the registered data
		let body = this.getData();
		if(body) this.setHeader('Content-Length',
			(new TextEncoder().encode(body)).length.toString());

		let options = {
			// If the body contains data, send a POST, otherwise a GET request
			method: body ? 'POST' : 'GET',

			// Guarantee that the User-Agent header is not overwritten
			headers: Object.assign(this.headers, {
				'User-Agent': NSRequest.useragent
			})
		}
		return {
			url: this.targetURL,
			body: body || null,
			options: options
		};
	}

	/**
	 * 
	 * @arg {IncomingMessage} response 
	 */
	evaluateErrors(response) {
		switch (response.statusCode) {
			case 304:
				throw new DumpNotModifiedError();
			case 403:
				throw new APIError('403 ' + response.statusMessage);
			case 409:
				throw new LoginError('Last non-pin login too recent');
			case 404:
				throw new EntityNotFoundError('Requested entity not found');
			case 429:
				throw new RatelimitError(response.headers['retry-after']);
			default: return;
		}
	}

	/**
	 * Sends an HTTP request with the specified {@link NSRequest#body body} to
	 * the {@link NSRequest#targetURL targetURL}. If not disabled, also
	 * respects the API rate limits.
	 * @returns {Promise<IncomingMessage>} The raw response to the request
	 */
	async raw() {
		const data = this.createRequestData();

		if(NSRequest.useRateLimit) await RateLimit.enforce();
		const response = await call(data)
			.catch((reason) => {
				throw new APIError(reason);
			});
		RateLimit.update(response.headers);

		this.evaluateErrors(response);

		return response;
	}

	/**
	 * @type {?(root) => NSFactory}
	 * @private
	 */
	factoryConfigurer = null;

	/**
	 * 
	 * @arg {(root) => NSFactory} factory 
	 * @package
	 */
	useFactory(factory) {
		this.factoryConfigurer = factory;
		return this;
	}

	/**
	 * Calls the {@link NSRequest#raw raw} function and passes its return value
	 * through a factory determined by the {@link matchFactory} function.
	 * @returns {Promise<any>} The chosen factory's finished `product`
	 */
	async send() {
		let res = await this.raw();
		if(!res)
			throw new NSError('Could not obtain API response');
		return new Promise((resolve, reject) => {
			/** @type {?NSFactory} */
			let factory = null;
			let parser = new Parser();
			let rawText = '';

			parser.on('opentag', (name, attrs) => {
				if(!factory) factory = this.factoryConfigurer?.(attrs)
					?? matchFactory(name, attrs);
				if(!factory) throw new NSError('No factory matching tag: ' + name);
		
				factory.handleOpen(name, attrs);
				return;
			});
			parser.on('closetag', (name) => factory?.handleClose(name));
			parser.on('text', (text) => {
				if(factory instanceof NSFactory) factory.handleText(text);
				else rawText += text;
			});
			parser.on('cdata', (cdata) => factory?.handleCData(cdata));	
			parser.on('error', (err) => reject(err));
			parser.on('finish', () => resolve(factory?.deliver() ?? rawText));

			res.pipe(parser);
		});
	}
}

/**
 * Superclass for all request subclasses that send data to the NS API.
 * 
 * Opens up methods to actually alter the request {@link NSRequest#body body},
 * namely:
 * - {@link DataRequest#setArgument}
 * - {@link DataRequest#getArgument}
 * - {@link DataRequest#getArguments}
 * - {@link DataRequest#removeArgument}
 * 
 * Via the {@link DataRequest#mandate} method, specific arguments can be
 * declared mandatory, and NationScript will not execute requests that do not
 * have values for the mandatory arguments in their `data`.
 * 
 * Lastly, it holds the user-configurable {@link DataRequest.version version}
 * property, which is used to request API responses in specific versions of the
 * NS API to ensure compatibility with the hard-coded types.
 */
class DataRequest extends NSRequest {

	/**
	 * Defines the version of the NS API to request all data in. If `null`,
	 * requests are made to the most recent version of the API automatically.
	 * @type {?string}
	 * @default
	 * @package
	 */
	static version = '12';

	/* === Interna === */

	/**
	 * List of argument names declared to be mandatory for this request.
	 * @type {string[]}
	 * @private
	 */
	mandatory = [];

	/**
	 * Instantiates a new {@linkcode DataRequest}. **Intended for internal use only.**
	 * @package
	 */
	constructor() {
		super();
		if(DataRequest.version)
			this.setArgument('v', DataRequest.version);
		this.setHeader('Content-Type', 'application/x-www-form-urlencoded; '
			+ 'charset=utf-8');
	}


	/* === Request Data Manipulation === */

	/**
	 * Save the given value under the given argument name in the request
	 * {@link NSRequest#body body}.
	 * @arg {string} key Key to save the value under
	 * @arg  {any[]} values Value(s) to save; joined with `+` if an array
	 * @returns {this} The request, for chaining
	 * @public
	 */
	setArgument(key, ...values) {
		if(key && values) this.body[key] = values.join('+');
		return this;
	}

	/**
	 * Get the value that is currently saved in this request's
	 * {@link NSRequest#body body} under the given key.
	 * @arg {string} key Name of the argument
	 * @returns {string} Data currently saved for that argument
	 * @public
	 */
	getArgument(key) {
		return this.body[key];
	}

	/**
	 * Get the keys of all values that are currently set in the request
	 * {@link NSRequest#body body}.
	 * @returns {string[]} List of all keys currently set
	 * @public
	 */
	getArguments() {
		return Object.keys(this.body);
	}

	/**
	 * Remove the value saved under the given key in the request
	 * {@link NSRequest#body body}.
	 * @arg {string} key Name of the key
	 * @returns {this} The request, for chaining
	 * @public
	 */
	removeArgument(key) {
		delete this.body[key];
		return this;
	}

	/**
	 * Registers the given parameter names as required to have a value set for
	 * them in the {@link NSRequest#body data} before executing the request.
	 * @param {...string} names Names of the URL parameters to mandate
	 * @returns {this} The request, for chaining
	 * @protected
	 */
	mandate(...names) {
		if(Array.isArray(names)) for(let name of names)
			if(!this.mandatory.includes(name)) this.mandatory.push(name);
		return this;
	}

	/** @inheritdoc */
	async raw() {
		// Verify that all required arguments are set
		if(this.mandatory.length > 0) {
			let missing = [];
			let saved = this.getArguments();
			for(let arg of this.mandatory) if(!saved.includes(arg)) missing.push(arg);
			if(missing.length > 0) throw new Error('Request misses mandatory arguments: '
					+ missing.join(', '));
		}
		return await super.raw();
	}
}

/**
 * Superclass for all request subclasses that address API endpoints that accept
 * specific shards.
 * 
 * Adds several functions to make setting, adding, and removing singular or
 * multiple shards from the request easier than with the {@link DataRequest}'s
 * more abstract argument manipulation methods.
 */
class ShardableRequest extends DataRequest {
	/**
	 * Defines specific shards to query from the NS API.
	 * @param  {...string} shards Identifiers of the desired shards
	 * @returns {this} The request, for chaining
	 * @public
	 */
	shard(...shards) {
		this.setArgument('q', ...shards);
		return this;
	}

	/**
	 * Adds more shards to any already set for this request.
	 * @param  {...string} shards Identifiers of the desired shards.
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
	 * @type {string}
	 */
	nation;

	/**
	 * The nation's password.
	 * @type {?string}
	 */
	password;

	/**
	 * The nation's password in encrypted form, as provided by NationStates.
	 * @type {?string}
	 */
	autologin;

	/**
	 * The login PIN of the current session. Valid until the nation's next login, it logs out, or
	 * is idle for two hours. Updated automatically when executing an authenticated request.
	 * @type {?string}
	 */
	pin;

	/**
	 * Creates a new {@linkcode NSCredential} instance with the given details.
	 * @param {string} nation Name of the nation the login credentials are for.
	 * @param {?string} password Password for the nation.
	 * @param {?string} autologin Autologin code for the nation.
	 */
	constructor(nation, password = null, autologin = null) {
		if(typeof nation !== 'string') throw new Error(`Invalid nation name (${nation})`);
		if(!password && !autologin) throw new Error('Missing required login information');
		this.nation = toIDForm(nation);
		this.password = password;
		this.autologin = autologin;
		this.pin = null;
	}

	/**
	 * Updates the autologin and PIN data from the provided header data.
	 * @arg {import('node:http').IncomingHttpHeaders} responseHeaders HTTP
	 *     headers returned by the NS API.
	 */
	updateFromResponse(responseHeaders) {
		let autologin = responseHeaders['x-autologin'];
		let pin = responseHeaders['x-pin'];

		if(typeof autologin === 'string') this.autologin = autologin;
		if(typeof pin === 'string') this.pin = pin;
	}
}

const Nation = require('../type/nation');
const Region = require('../type/region');
const Card = require('../type/card');
const CardWorld = require('../type/card-world');
const World = require('../type/world');
const WorldAssembly = require('../type/world-assembly');

/**
 * Tries to match one of the configured top-level factories to the given root
 * tag to parse the XML data it contains into a NationScript object.
 * @arg {string} root Name of the root node
 * @arg {Object.<string, string>} attrs Attributes on the root node
 * @returns {?NSFactory} A factory matching the root tag; `null` if none found
 */
function matchFactory(root, attrs) {
	switch(root) {
		case 'NATION':	return Nation.create(attrs);
		case 'REGION':	return Region.create(attrs);
		case 'CARD':	return Card.create(attrs);
		case 'CARDS':	return CardWorld.create(attrs);
		case 'WORLD':	return World.create(attrs);
		case 'WA':		return WorldAssembly.create(attrs);
		default: return null;
	}
}

/**
 * Converts the given string - usually the name of a nation or region - into
 * `id_form` to guarantee that the NS API can understand it.
 * @param {string} name String to convert
 * @returns {string} The converted string
 * @package
 * @ignore
 */
function toIDForm(name) {
	return name.trim().replace(/ /g, '_').toLowerCase();
}

/**
 * Calls the {@link toIDForm} function on all elements of the supplied string
 * array, mutating the array in the process.
 * @param {string[]} names List to convert all the elements of
 * @returns {string[]} The given array, with its contents converted
 * @package
 * @ignore
 */
function listToIDForm(names) {
	for(let i = 0; i < names.length; i++) names[i] = toIDForm(names[i]);
	return names;
}

/**
 * @typedef NSRequestData
 * @prop {string} url
 * @prop {?string} body
 * @prop {https.RequestOptions} options
 */
/**
 * Sends an HTTP query to the given URL.
 * @arg {NSRequestData} data 
 * @returns {Promise<IncomingMessage>} The response from the queried URL.
 * @package
 * @ignore
 */
function call(data) {
	return new Promise((resolve, reject) => {
		let request = https
			.request(data.url, data.options, response => resolve(response))
			.once('error', e => reject(e));
		if(data.body && data.options.method === 'POST') request.write(data.body);
		request.end();
	});
}


exports.NSRequest = NSRequest;
exports.DataRequest = DataRequest;
exports.ShardableRequest = ShardableRequest;
exports.NSCredential = NSCredential;
exports.toIDForm = toIDForm;
exports.listToIDForm = listToIDForm;
