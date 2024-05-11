/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Internal module providing the basic request builder classes.
 * @module nationscript/requests/base
 */

const { Stream } = require('node:stream');
const http = require('node:http');
const https = require('node:https');

const Parser = require('node-xml-stream-parser');

const {
	NSError,
	APIError,
	EntityNotFoundError,
	RecentLoginError,
	RatelimitError,
	DumpNotModifiedError
} = require('../errors');
const ratelimit = require('./ratelimit');
const factory = require('../factory');

/**
 * @typedef NSRequestData
 * @prop {string} url
 * @prop {?string} body
 * @prop {https.RequestOptions} options
 */
/**
 * The mother of superclasses, inherited by all specialised request classes.
 * 
 * Holds static properties configurable by the user to en/disable the built-in
 * rate-limiter of NationScript and, most importantly, set the user agent for
 * identifying the user to NS admins.
 * 
 * The {@link NSRequest#raw raw} function is invoked by every single execution
 * of a request subclass, returning the API's raw response in the form of an
 * `IncomingMessage`.
 * 
 * The {@link NSRequest#send send} function calls the {@link NSRequest#raw raw}
 * function, and then parses the body using the `node-xml-stream-parser`
 * package, sending emitted events to the {@link factory.NSFactory NSFactory}
 * created by the set {@link NSRequest#factoryConfigurer factoryConfigurer}.
 */
class NSRequest {

	/* === General Customisation - Called From api.js Only === */

	/**
	 * The text that sent as the `User-Agent` header in requests to the NS API.
	 * @type {?string}
	 * @package
	 */
	static useragent = null;

	/**
	 * Whether to use the in-built rate-limiter for requests to the NS API.
	 * @type {boolean}
	 * @default true
	 * @package
	 */
	static useRateLimit = true;


	/* === Request preparation === */

	/**
	 * The URL to send this request to.
	 * @type {string}
	 * @private
	 * @default
	 */
	targetURL = 'https://www.nationstates.net/cgi-bin/api.cgi';

	/**
	 * Configures this request to be sent to the given URL.
	 * @arg {string} url URL to target
	 * @returns {this} The request, for chaining
	 * @protected
	 */
	setTargetURL(url) {
		if(typeof url !== 'string')
			throw new TypeError('Invalid target URL: ' + url);
		this.targetURL = url;
		return this;
	}

	/**
	 * Additional headers to send with this request.
	 * @type {http.OutgoingHttpHeaders}
	 * @private
	 */
	headers = {};

	/**
	 * Registers the given value to be sent under the given header name when
	 * this request is executed.
	 * @arg {string} name Header name
	 * @arg {string} value Header value
	 * @returns {this} The request, for chaining
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
	 * @returns {this} The request, for chaining
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
	 * Compiles the defined {@link NSRequest#body body}, 
	 * {@link NSRequest.useragent useragent} and other
	 * {@link NSRequest#headers headers}, and
	 * {@link NSRequest#targetURL targetURL} into a single object for use in
	 * the {@link NSRequest#executeHTTP executeHTTP} function.
	 * @returns {NSRequestData} The compiled information
	 * @private
	 */
	createRequestData() {
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
	 * Makes an HTTP request containing the given `data`.
	 * @arg {NSRequestData} data Information to send with the request
	 * @returns {Promise<http.IncomingMessage>} The response
	 * @private
	 */
	async executeHTTP(data) {
		return new Promise((resolve, reject) => {
			let request = https
				.request(this.targetURL,
					data.options,
					response => resolve(response))
				.once('error', e => reject(e));
			if(data.body && data.options.method === 'POST')
				request.write(data.body);
			request.end();
		});
	}

	/**
	 * Checks the given response for the various errors that may be indicated
	 * by the NS API.
	 * @arg {http.IncomingMessage} response Response to check
	 * @private
	 */
	evaluateErrors(response) {
		switch (response.statusCode) {
			case 304:
				throw new DumpNotModifiedError();
			case 403:
				throw new APIError('403 ' + response.statusMessage);
			case 409:
				throw new RecentLoginError();
			case 404:
				throw new EntityNotFoundError();
			case 429:
				throw new RatelimitError(response.headers['retry-after']);
			default:
				if(!response.statusCode) return;
				if(response.statusCode < 200 || response.statusCode >= 300)
					throw new APIError(response.statusCode
						+ ' ' + response.statusMessage);
				return;
		}
	}

	/**
	 * Checks whether the {@link NSRequest.useragent useragent} is set, then
	 * calls the {@link NSRequest#executeHTTP executeHTTP} function and returns
	 * its response. If {@link NSRequest.useRateLimit useRateLimit} is `true`,
	 * the request is ensured to respect the API's rate-limit.
	 * @returns {Promise<http.IncomingMessage>} The raw response to the request
	 */
	async raw() {
		if(NSRequest.useragent == null) throw new NSError('Missing UserAgent');

		if(NSRequest.useRateLimit) await ratelimit.enforce();
		const response = await this.executeHTTP(this.createRequestData())
			.catch((reason) => {
				throw new APIError(reason);
			});
		ratelimit.update(response.headers);

		this.evaluateErrors(response);

		return response;
	}

	/**
	 * Gets the data stream containing the XML to parse within the
	 * {@link NSRequest#send send} function.
	 * 
	 * **Note:** This "middleman" function between the `send` and `raw`
	 * functions is needed so the `DumpRequest` can cleanly override the
	 * getting of the XML stream. Since it can either use a `ReadStream` or an
	 * `IncomingMessage`, depending on the `DumpMode`, but the former is
	 * missing properties of the latter, the type-checker will complain if
	 * `raw` is overridden with the possibility of returning a `ReadStream`.
	 * @returns {Promise<Stream>} Stream with the XML data
	 * @protected
	 */
	async getStream() {
		return await this.raw();
	}

	/**
	 * Function to instantiate a factory instance with which to ultimately
	 * parse the XML returned by the API.
	 * 
	 * Since the various factories all need the attributes on their root tag
	 * passed as parameter upon creation, they can only be actually
	 * instantiated while parsing is in progress, hence saving the
	 * instantiating function and not the factory itself.
	 * @type {?factory.FactoryConstructor<any>}
	 * @private
	 */
	factoryConfigurer = null;

	/**
	 * Configures this request use the given function for creating the root
	 * factory during XML parsing.
	 * @arg {factory.FactoryConstructor<any>} factory Creation function to use
	 * @returns {this} The request, for chaining
	 * @protected
	 */
	useFactory(factory) {
		this.factoryConfigurer = factory;
		return this;
	}

	/**
	 * Calls the {@link NSRequest#raw raw} function and passes the returned
	 * response stream through the `node-xml-stream-parser`. The emitted events
	 * are in turn handled by a factory created using the defined
	 * {@link NSRequest#factoryConfigurer factoryConfigurer}, or, if none is
	 * set, the factory determined by the {@link matchFactory} function.
	 * @returns {Promise<?any>} The chosen factory's finished `product`
	 */
	async send() {
		let res = await this.getStream();
		if(!res) throw new NSError('Could not obtain XML stream');
		return new Promise((resolve, reject) => {
			/**
			 * @type {?factory.NSFactory}
			 * @ignore
			 */
			let factory = null;
			let parser = new Parser();

			// Just pass the received events to the factory for handling
			parser.on('opentag', (name, attrs) => {
				// At the first tag received, the defined factory is created
				if(!factory) {
					factory = this.factoryConfigurer?.(attrs)
						?? matchFactory(name, attrs);
					if(!factory)
						throw new NSError('No factory matching tag: ' + name);
				}
				else factory.handleOpen(name, attrs);
			});
			parser.on('closetag', (name) => factory?.handleClose(name));
			parser.on('text', (text) => factory?.handleText(text));
			parser.on('cdata', (cdata) => factory?.handleCData(cdata));	

			// If an error is encountered, fail; if the stream ends, succeed
			parser.on('error', (err) => reject(err));
			parser.on('finish', () => resolve(factory?.deliver() ?? null));

			res.pipe(parser);
		});
	}
}

/**
 * Superclass for all request subclasses that send data to the NS API.
 * 
 * Opens up methods to actually alter the request {@link NSRequest#body body},
 * namely:
 * - {@link DataRequest#setArgument setArgument}
 * - {@link DataRequest#setArguments setArguments}
 * - {@link DataRequest#getArgument getArgument}
 * - {@link DataRequest#getArguments getArguments}
 * - {@link DataRequest#removeArgument removeArguments}
 * 
 * Via the {@link DataRequest#mandate mandate} method, specific arguments can
 * be declared mandatory, and NationScript will not execute requests that do
 * not have values for the mandatory arguments in their `body`.
 * 
 * Lastly, it holds the user-configurable {@link DataRequest.version version}
 * property, which is used to request API responses in specific versions of the
 * NS API to ensure compatibility with the hard-coded types.
 */
class DataRequest extends NSRequest {

	/**
	 * Defines the version of the NS API to request all data in. If `null`,
	 * requests are made to the most recent version of the API automatically.
	 * @type {?number}
	 * @default
	 * @package
	 */
	static version = 12;

	/* === Interna === */

	/**
	 * List of argument names declared to be mandatory for this request.
	 * @type {string[]}
	 * @private
	 */
	mandatory = [];

	/**
	 * Instantiates a new `DataRequest`, defining the `Content-Type` in the
	 * {@link NSRequest#headers headers} and setting the
	 * {@link DataRequest.version version}, if required.
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
	 * Set the given value under the given argument name in the request
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
	 * Set all the given keys and values in the request
	 * {@link NSRequest#body body}.
	 * @arg {Object.<string, string>} pairs Key-value pairs of arguments
	 * @arg {boolean} replace `true` to replace all current arguments, `false`
	 *     to merely add them to the extant arguments (default)
	 * @returns {this} The request, for chaining
	 */
	setArguments(pairs, replace = false) {
		if(typeof pairs === 'object')
			if(replace) this.body = pairs;
			else Object.assign(this.body, pairs);
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
	 * @arg {...string} names Names of the URL parameters to mandate
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
		let saved = this.getArguments();
		for(let arg of this.mandatory) if(!saved.includes(arg))
			throw new Error('Request misses mandatory argument: ' + arg);
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
	 * @arg  {...string} shards Identifiers of the desired shards
	 * @returns {this} The request, for chaining
	 * @public
	 */
	shard(...shards) {
		this.setArgument('q', ...shards);
		return this;
	}

	/**
	 * Adds more shards to any already set for this request.
	 * @arg  {...string} shards Identifiers of the desired shards
	 * @returns {this} The request, for chaining
	 */
	addShards(...shards) {
		this.shard(...this.getShards(), ...shards);
		return this;
	}

	/**
	 * Gets all shards currently registered to be queried with this request.
	 * @returns {string[]} Names of all shards currently set in this request
	 */
	getShards() {
		return this.getArgument('q')?.split('+') || [];
	}

	/**
	 * Removes all previously set sharding from this request.
	 * @returns {this} The request, for chaining
	 */
	clearShards() {
		this.removeArgument('q');
		return this;
	}

	/**
	 * Removes the specified shards from those to be queried with this request.
	 * @arg  {...string} shards Identifiers of the unwanted shards
	 * @returns {this} The request, for chaining
	 */
	removeShards(...shards) {
		let remain = this.getShards().filter((s) => !shards.includes(s));
		return this.clearShards().shard(...remain);
	}
}

/**
 * Helper class for saving login credentials of a nation.
 * 
 * If passed to an {@link NSRequest} that authenticates with the NS API upon
 * execution, the {@link NSCredential#autologin autologin} and
 * {@link NSCredential#pin pin} properties of the passed instance are updated
 * automatically from the API's response, so ideally there should be only a
 * single instance for any one nation, so that the PIN can be properly kept.
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
	 * The login PIN of the current session. Valid until the nation next logins
	 * without it, logs out, or is idle for two hours.
	 * @type {?string}
	 */
	pin;

	/**
	 * Creates a new {@link NSCredential} instance with the given details.
	 * @arg {string} nation Name of the nation the login credentials are for
	 * @arg {?string} password Password for the nation
	 * @arg {?string} autologin Autologin code for the nation
	 */
	constructor(nation, password = null, autologin = null) {
		if(!password && !autologin)
			throw new NSError('Missing required login information');
		this.nation = toIDForm(nation);
		this.password = password;
		this.autologin = autologin;
		this.pin = null;
	}

	/**
	 * Updates the autologin and PIN data from the provided header data.
	 * @arg {http.IncomingHttpHeaders} responseHeaders HTTP headers returned by
	 *     the NS API.
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
 * @returns {?factory.NSFactory} Factory matching the root tag, if found
 */
function matchFactory(root, attrs) {
	switch(root) {
		case 'NATION':	return Nation.create([])(attrs);
		case 'REGION':	return Region.create([])(attrs);
		case 'CARD':	return Card.create(attrs);
		case 'CARDS':	return CardWorld.create(attrs);
		case 'WORLD':	return World.create([])(attrs);
		case 'WA':		return WorldAssembly.create(attrs);
		default: return null;
	}
}

/**
 * Converts the given string - usually the name of a nation or region - into
 * `id_form` to guarantee that the NS API can understand it.
 * @arg {string} name String to convert
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
 * @arg {string[]} names List to convert all the elements of
 * @returns {string[]} The given array, with its contents converted
 * @package
 * @ignore
 */
function listToIDForm(names) {
	for(let i = 0; i < names.length; i++) names[i] = toIDForm(names[i]);
	return names;
}

exports.NSRequest = NSRequest;
exports.DataRequest = DataRequest;
exports.ShardableRequest = ShardableRequest;
exports.NSCredential = NSCredential;
exports.toIDForm = toIDForm;
exports.listToIDForm = listToIDForm;
