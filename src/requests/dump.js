/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* === Imports === */

const fs = require('node:fs');
const zlib = require('node:zlib');

const {
	NSRequest
} = require('./base');
const {
	NSError,
	VirtualError,
	DumpNotModifiedError
} = require('../errors');

const Factory = require('../factory');
const DumpNation = require('../type/dump-nation');
const DumpRegion = require('../type/dump-region');
const DumpCard = require('../type/dump-card');


/* === Classes === */

/**
 * Superclass for all specialised request classes interacting with Daily Data
 * Dumps, including archived ones.
 * 
 * Defines overrides of the {@linkcode NSRequest.raw()} and {@linkcode NSRequest.send()} functions
 * to adapt to the required unzipping and the different possible {@linkcode DumpMode}s.
 */
class DumpRequest extends NSRequest {
	/**
	 * Path to where local copies of the daily data dumps should be saved.
	 * @type {string}
	 * @default
	 * @static
	 */
	static directory = './nsdumps';

	/**
	 * @arg {string} url External URL to fetch the Dump from, if needed
	 */
	constructor(url) {
		super();
		this.setTargetURL(url);

		// If it doesn't exist yet, the base directory for the storage of local
		// dump copies is created
		try {
			fs.mkdirSync(DumpRequest.directory);
		} catch (e) {
			throw new NSError('Unable to create data dump directory');
		}
	}

	/**
	 * @returns {string} Path to the file to save the local Dump copy as
	 * @virtual
	 * @protected
	 */
	getFilePath() {
		throw new VirtualError(this.getFilePath,
			this.constructor);
	}

	/**
	 * {@link DumpMode} in which to execute this request.
	 * @type {number}
	 * @private
	 */
	mode;

	/**
	 * Configure this request to use the specified {@link DumpMode}.
	 * @arg {number} mode Mode to use
	 * @returns {this} The request, for chaining
	 */
	setMode(mode) {
		this.mode = mode;
		return this;
	}

	/**
	 * Filter function to use for this request.
	 * @type {Factory.FactoryDecider<any>}
	 * @protected
	 */
	filter = (obj) => false;

	/**
	 * Configure the filter function to apply to newly parsed objects. While
	 * parsing objects from the Dump XML, the filter function is called for
	 * each new object; if it returns `true`, the object is kept, otherwise it
	 * is discarded.
	 * @arg {Factory.FactoryDecider<any>} filter Filter to use
	 * @returns {this} The request, for chaining
	 */
	setFilter(filter) {
		if(typeof filter === 'function') this.filter = filter;
		return this;
	}

	/**
	 * Attempts to read the local file specified in the
	 * {@link DumpRequest#file file} property.
	 * @returns {?fs.ReadStream} Stream of the locally-saved data, if found
	 * @private
	 */
	rawLocal() {
		try {
			return fs.createReadStream(this.getFilePath());
		} catch (e) {
			return null;
		}
	}

	/**
	 * Get the raw readable stream of the queried Dump data. The original
	 * stream - depending on the {@link DumpMode} used, either from the local
	 * Dump copy or the remote copy on the NationStates servers - is `pipe()`d
	 * first through a write stream to the local {@link DumpRequest#file file},
	 * if necessary, and in any case will finally be `pipe()`d through a
	 * `zlib.Gunzip` stream, which is the ultimate return value.
	 * @returns {Promise<zlib.Gunzip>} Stream of the fetched data, if found
	 * @override
	 */
	async raw() {
		let read = null;
		let write = null;
		let file = this.getFilePath();
		
		switch(this.mode) {
			case DumpMode.DOWNLOAD:
				read = await super.raw();
				write = fs.createWriteStream(file);
				break;

			case DumpMode.DOWNLOAD_IF_CHANGED:
				this.setHeader('If-Modified-Since', 
					formatDateHeader(fs.statSync(file).mtime));
				try {
					read = await super.raw();
					write = fs.createWriteStream(file);
				} catch(e) {
					if(e instanceof DumpNotModifiedError)
						read = this.rawLocal();
					else throw e;
				}
				break;

			case DumpMode.LOCAL:
				read = this.rawLocal();
				break;

			case DumpMode.LOCAL_OR_DOWNLOAD:
				read = this.rawLocal();
				if(read) break;
				read = await super.raw();
				write = fs.createWriteStream(file);
				break;

			case DumpMode.REMOTE:
				read = await super.raw();
				break;
		}
		if(!read) throw new NSError('Could not obtain dump data');
		if(write) read.pipe(write);
		return read.pipe(zlib.createGunzip());
	}

	/**
	 * Executes this request according to the set {@link DumpMode}.
	 * @returns {Promise<object[]>} List of all instantiated objects satisfying the filter.
	 * @override
	 */
	async send() {
		return await super.send();
	}
}

class DateDumpRequest extends DumpRequest {
	/**
	 * Date for which to get the Data Dump with this request
	 * @type {Date}
	 */
	date;

	/**
	 * Set the {@link DateDumpRequest#date date} of which to get the Dump of.
	 * @arg {Date} date Date of the desired Dump
	 * @returns {this} The request, for chaining
	 */
	setDate(date) {
		if(date instanceof Date) this.date = date;
		return this;
	}
}

/**
 * Request subclass for reading the nations Daily Data Dump (archive).
 */
class NationDumpRequest extends DateDumpRequest {
	constructor(date) {
		let path = same(date, new Date())
			? 'pages/nations.xml.gz'
			: `archive/nations/${formatDateDump(date)}-nations-xml.gz`;
		super('https://www.nationstates.net/' + path);
	}

	/** @inheritdoc */
	getFilePath() {
		return DumpRequest.directory
			+ '/nations_' 
			+ formatDateDump(this.date)
			+ '.xml.gz';
	}

	/**
	 * Only nations fulfilling the `filter` are returned.
	 * @returns {Promise<DumpNation.DumpNation[]>}
	 * @inheritdoc
	 */
	async send() {
		this.useFactory(DumpNation.createArray(this.filter))
		return await super.send();
	}
}

/**
 * Request subclass for reading the regions Daily Data Dump (archive).
 */
class RegionDumpRequest extends DateDumpRequest {
	constructor(date) {
		let path = same(date, new Date())
			? 'pages/regions.xml.gz'
			: `archive/regions/${formatDateDump(date)}-regions-xml.gz`;
		super('https://www.nationstates.net/' + path);
	}

	/** @inheritdoc */
	getFilePath() {
		return DumpRequest.directory
			+ '/nations_' 
			+ formatDateDump(this.date)
			+ '.xml.gz';
	}

	/**
	 * Only regions fulfilling the `filter` are returned.
	 * @returns {Promise<DumpRegion.DumpRegion[]>}
	 * @inheritdoc
	 */
	async send() {
		this.useFactory(DumpRegion.createArray(this.filter))
		return await super.send();
	}
}

/**
 * Request subclass for reading the cards Seasonal Data Dump (archive).
 */
class CardDumpRequest extends DumpRequest {
	season = 3;
	constructor(season) {
		super(`https://www.nationstates.net/pages/cardlist_S${season}.xml.gz`);
		this.season = season;
	}

	/** @inheritdoc */
	getFilePath() {
		return DumpRequest.directory
			+ '/cards_s' 
			+ this.season
			+ '.xml.gz';
	}

	/**
	 * Only cards fulfilling the `filter` are returned.
	 * @returns {Promise<DumpCard.DumpCard[]>}
	 * @inheritdoc
	 */
	async send() {
		this.useFactory(DumpCard.createArray(this.filter))
		return await super.send();
	}
}


/* === Date Handling === */
// Or, Why is there no a generic pattern-based date formatter like in Java? :(

/**
 * Ensures that the given number spans two digits -
 * numbers less than `10` will receive a `'0'` prefix.
 * @arg {number} num Number to modify.
 * @returns {string} The number as string, if necessary prefixed with a `0`.
 * @ignore
 */
function twoDigit(num) {
	return num >= 10 ? num.toString() : '0' + num;
}

/**
 * Formats the given date into a string usable to create Dump addresses on the NS servers.
 * @arg {Date} date Date to format.
 * @returns {string} A string of the format `YYYY-MM-DD`.
 * @ignore
 */
function formatDateDump(date) {
	return [date.getFullYear(),
		twoDigit(date.getMonth() + 1),	// Month is 0-indexed
		twoDigit(date.getDate())
	].join('-');
}

/**
 * Weekday abbreviations for the {@link formatDateHeader} function.
 * @ignore
 */
const DAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Month abbreviations for the {@link formatDateHeader} function.
 * @ignore
 */
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
	'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats the given date into a string usable for the `If-Modified-Since` HTTP request header.
 * @arg {Date} date Date to format.
 * @returns {string} A string of the format `Weekday, DD MMMM YYYY HH:MM:SS GMT`
 * @ignore
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
 * @ignore
 */
function same(date1, date2) {
	return date1.getUTCDate() === date2.getUTCDate()
		&& date1.getUTCMonth() === date2.getUTCMonth()
		&& date1.getUTCFullYear() === date2.getUTCFullYear();
}


/* === Exports === */

exports.DumpRequest = DumpRequest;
exports.CardDumpRequest = CardDumpRequest;
exports.NationDumpRequest = NationDumpRequest;
exports.RegionDumpRequest = RegionDumpRequest;

/**
 * Supported ways of getting Daily Data Dump contents.
 * @enum {number}
 */
const DumpMode = {
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
	REMOTE: 4
};

exports.DumpMode = DumpMode;
