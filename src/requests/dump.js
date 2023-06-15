/**
 * @license
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* === Imports === */

const fs = require('node:fs');
const { IncomingMessage } = require('node:http');
const zlib = require('node:zlib');

const flow = require('xml-flow');

const {
	NSRequest,
	call
} = require('./base');
const { Region } = require('./region');
const { Nation } = require('./nation');
const { Card } = require('./card');


/* === Classes === */

/**
 * Superclass for all specialised request classes interacting with the Daily Data Dumps (archive).
 * 
 * Defines overrides of the {@linkcode NSRequest.raw()} and {@linkcode NSRequest.send()} functions
 * to adapt to the required unzipping and the different possible {@linkcode DumpMode}s.
 */
class DumpRequest extends NSRequest {
	/**
	 * Path to where local copies of the daily data dumps should be saved.
	 * @type string
	 * @default './nsdumps'
	 * @static
	 */
	static directory = './nsdumps';

	/**
	 * URL to which the HTTP request will be sent.
	 * @type string
	 * @private
	 */
	#url;

	/**
	 * Mode in which to execute this request.
	 * @type number
	 * @see {@linkcode DumpMode}
	 * @private
	 */
	#mode;

	/**
	 * Path to the file to save a local copy of the requested Dump in.
	 * @type string
	 * @private
	 */
	#file;

	/**
	 * Instantiates a new {@linkcode DumpRequest}. **Intended for internal use only.**
	 * @param {number} mode {@linkcode DumpMode} to use.
	 * @param {string} url URL to fetch the Dump from, if {@linkcode DumpMode.LOCAL} isn't used.
	 * @param {string} file Name of the file to write the Dump data to locally.
	 */
	constructor(mode, url, file) {
		super();
		this.#url = url;
		this.#mode = mode;
		try { fs.mkdirSync(DumpRequest.directory); } 
		catch (e) { }
		this.#file = `${DumpRequest.directory}/${file}`;
		console.log(this.#file);
	}

	/**
	 * Attempts to read the local file specified in the {@linkcode DumpRequest.#file} property.
	 * @returns {fs.ReadStream} Stream of the locally-saved data.
	 * @private
	 */
	#local() {
		console.log('loading from lcoal');
		try {
			return fs.createReadStream(this.#file);
		} catch (e) {
			return null;
		}
	}

	/**
	 * Attempts to read the file saved at the location specified in the {@linkcode DumpRequest.#url}
	 * property. If {@linkcode DumpMode.DOWNLOAD_IF_CHANGED} is used, the remote-reading process
	 * may terminate if no new Dump is recognized, and instead try to read the local Dump data.
	 * @returns {Promise<fs.ReadStream | IncomingMessage>} Stream of the fetched data.
	 * @private
	 */
	async #remote() {
		// Verify that a user agent has been set
		if(NSRequest.useragent == null) throw new Error('No user agent set');

		// Configure the request headers
		let headers = {
			'User-Agent': NSRequest.useragent
		}
		if(this.#mode === exports.DumpMode.DOWNLOAD_IF_CHANGED) try {
			let fileStats = fs.statSync(this.#file);
			headers['If-Modified-Since'] = formatDateHeader(fileStats.mtime);
			console.log(headers);
		} catch (e) { }	// File not found = Dump gets requested in any case

		// Meet rate-limit, then send the actual HTTP request
		if(NSRequest.useRateLimit) await this.ratelimit();
		let response = await call(this.#url, {
			method: 'GET',
			headers: headers
		});

		// If everything went smoothly, return the response stream
		if(response.statusCode >= 200 && response.statusCode < 300) return response;

		// If the Dump was not modified since last downloading it, return the local copy
		if(response.statusCode === 304) return this.#local();

		throw new Error(`API Error: ${response.statusCode} ${response.statusMessage}`);
	}

	/**
	 * Gets the raw readable stream of the queried Dump data. The original stream - depending on
	 * the {@linkcode DumpMode} used, either from the local Dump copy or the remote copy on the
	 * NationStates servers - is `pipe()`d through a `zlib.Gunzip` stream automatically, which will
	 * be the final return value.
	 * @returns {Promise<zlib.Gunzip>} Stream of the fetched data; `null` if none could be found.
	 */
	async raw() {
		let res;
		switch(this.#mode) {
		case exports.DumpMode.DOWNLOAD:
		case exports.DumpMode.DOWNLOAD_IF_CHANGED:
			res = await this.#remote();
			if(res instanceof IncomingMessage) res?.pipe(fs.createWriteStream(this.#file));
			break;

		case exports.DumpMode.READ_REMOTE:
			res = await this.#remote();
			break;

		case exports.DumpMode.LOCAL:
			res = this.#local();
			break;

		case exports.DumpMode.LOCAL_OR_DOWNLOAD:
			res = this.#local();
			if(!res) {
				res = await this.#remote();
				res?.pipe(fs.createWriteStream(this.#file));
			}
			break;
		}
		return res?.pipe(zlib.createGunzip());
	}

	/**
	 * Executes this request according to the {@linkcode DumpMode} set on instantiation.
	 * Objects instantiated with the data read from the Dump are passed to the filter function,
	 * which is expected to return `true` or `false` for them to indicate whether to save them in
	 * the results list. Once the Dump has been fully read, the Promise resolves to that list.
	 * @param {string} tag Name of the XML tag to use as root tag of target objects.
	 * @param {Function} Target Constructor function for the classes to instantiate from the XML.
	 * @param {(obj: any) => boolean} filter Function deciding which of the objects to keep.
	 * @returns {Promise<object[]>} List of all instantiated objects satisfying the filter.
	 */
	async send(tag, Target, filter = () => false) {
		let res = await this.raw();
		if(!res) throw new Error('Dump not found');

		// Configure the xml-flow parser
		let listener = flow(res, {
			simplifyNodes: false,	// These two are necessary to allow a semi-standardised
			useArrays: flow.ALWAYS,	// creation of response objects without too much hassle.
			lowercase: false		// Also, staying faithful to NS API response formatting :P
		});

		return new Promise((resolve, reject) => {
			let ret = [];
			listener.on(`tag:${tag?.toUpperCase()}`, (e) => {
				let r = new Target(e);
				if(filter(r)) ret.push(r);
			});
			listener.once('error', (e) => reject(e));
			listener.once('end', () => resolve(ret));
		});
	}
}

/**
 * Request subclass for reading the nations Daily Data Dump (archive).
 */
class NationDumpRequest extends DumpRequest {
	constructor(mode, date) {
		let formatted = formatDateDump(date);
		super(mode, 'https://www.nationstates.net/' + (same(date, new Date())
			? 'pages/nations.xml.gz'
			: `archive/nations/${formatted}-nations-xml.gz`),
			`nations_${formatted}.xml.gz`
		);
	}

	/**
	 * Executes this request according to the {@linkcode DumpMode} set on instantiation.
	 * Nation objects read from the Dump are passed to the given filter function, which is expected
	 * to return `true` or `false` for them to indicate whether to save the respective Nation in
	 * the result list. Once the Dump has been fully read, the Promise resolves to that list.
	 * @param {(n: Nation) => boolean} filter Function deciding which nations to return.
	 * @returns {Promise<Nation[]>} List of all nations satisfying the `filter` function.
	 */
	async send(filter) {
		return await super.send('NATION', Nation, filter);
	}
}

/**
 * Request subclass for reading the regions Daily Data Dump (archive).
 */
class RegionDumpRequest extends DumpRequest {
	constructor(mode, date) {
		let formatted = formatDateDump(date);
		super(mode, 'https://www.nationstates.net/' + (same(date, new Date())
			? 'pages/regions.xml.gz'
			: `archive/regions/${formatted}-regions-xml.gz`),
			`regions_${formatted}.xml.gz`
		);
	}

	/**
	 * Executes this request according to the {@linkcode DumpMode} set on instantiation.
	 * Region objects read from the Dump are passed to the given filter function, which is expected
	 * to return `true` or `false` for them to indicate whether to save the respective Region in
	 * the result list. Once the Dump has been fully read, the Promise resolves to that list.
	 * @param {(r: Region) => boolean} filter Function deciding which regions to return.
	 * @returns {Promise<Region[]>} List of all regions satisfying the `filter` function.
	 */
	async send(filter) {
		return await super.send('REGION', Region, filter);
	}
}

/**
 * Request subclass for reading the cards Seasonal Data Dump (archive).
 */
class CardDumpRequest extends DumpRequest {
	constructor(mode, season) {
		super(mode, `https://www.nationstates.net/pages/cardlist_S${season}.xml.gz`,
			`cards_s${season}.xml.gz`);
	}

	/**
	 * Executes this request according to the {@linkcode DumpMode} set on instantiation.
	 * Card objects read from the Dump are passed to the given filter function, which is expected
	 * to return `true` or `false` for them to indicate whether to save the respective Card in
	 * the result list. Once the Dump has been fully read, the Promise resolves to that list.
	 * @param {(c: Card) => boolean} filter Function deciding which cards to return.
	 * @returns {Promise<Card[]>} List of all cards satisfying the `filter` function.
	 */
	async send(filter) {
		return await super.send('CARD', Card, filter);
	}
}


/* === Date Handling === */
// Or, "Why can't you just have a generic pattern-based date formatter like Java, JS???!?!!?!?"

/**
 * Ensures that the given number occupies two digits -
 * numbers less than `10` will receive a `'0'` prefix.
 * @param {number} num Number to modify.
 * @returns {string} The number as string, if necessary prefixed with a 0.
 */
function twoDigit(num) {
	return num >= 10 ? num.toString() : '0' + num;
}

/**
 * Formats the given date into a string usable to create Dump addresses on the NS servers.
 * @param {Date} date Date to format.
 * @returns {string} A string of the format `YYYY-MM-DD`.
 */
function formatDateDump(date) {
	return [date.getFullYear(),
		twoDigit(date.getMonth() + 1),	// Month is 0-indexed
		twoDigit(date.getDate())
	].join('-');
}

/** Indexed list of day-of-week abbreviations for the {@linkcode formatDateHeader} function. */
const DAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Indexed list of month abbreviations for the {@linkcode formatDateHeader} function. */
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats the given date into a string usable for the `If-Modified-Since` HTTP request header.
 * @param {Date} date Date to format.
 * @returns {string} A string of the format `Weekday, DD Month YYYY HH:MM:SS GMT`.
 */
function formatDateHeader(date) {
	return DAY[date.getDay() - 1]
		+ ', '+ twoDigit(date.getDate())
		+ ' ' + MONTH[date.getMonth()]
		+ ' ' + date.getFullYear()
		+ ' ' + twoDigit(date.getHours())
		+ ':' + twoDigit(date.getMinutes())
		+ ':' + twoDigit(date.getSeconds())
		+ ' GMT';
}

/**
 * Checks whether the two supplied `Date`s point towards the same day.
 * @param {Date} date1 First of the two `Date`s to compare.
 * @param {Date} date2 Second of the two `Date`s to compare.
 * @returns {boolean} `true` if both `Date`s point to the same day, otherwise `false`.
 */
function same(date1, date2) {
	return date1.getUTCDate() === date2.getUTCDate()
		&& date1.getUTCMonth() === date2.getUTCMonth()
		&& date1.getUTCFullYear() === date2.getUTCFullYear();
}


/* === Exports === */

/**
 * Supported ways of getting Daily Data Dump contents.
 * @enum number
 */
exports.DumpMode =  Object.freeze({
	/**
	 * Download the Dump, then read the local copy. Makes one API request.
	 */
	DOWNLOAD: 0,
	/**
	 * Download the Dump only if its last-modified timestamp is newer than that of a local copy of
	 * the Dump; if no local copy exists or the Dump is newer than the local copy, it is downloaded
	 * and then the local copy is read. Makes one API request.
	 */
	DOWNLOAD_IF_CHANGED: 1,
	/**
	 * Read the local copy of the Dump. If none exists, the request fails. Makes no API requests.
	 */
	LOCAL: 2,
	/**
	 * Read the local copy of the Dump; if none exists, download it, in which case an API request
	 * is made (otherwise, none are).
	 */
	LOCAL_OR_DOWNLOAD: 3,
	/**
	 * Read the Dump directly from the API without creating a local copy. Makes one API request.
	 */
	READ_REMOTE: 4
});

exports.DumpRequest			= DumpRequest;
exports.CardDumpRequest		= CardDumpRequest;
exports.NationDumpRequest	= NationDumpRequest;
exports.RegionDumpRequest	= RegionDumpRequest;
