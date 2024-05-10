/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Internal module providing request builder classes specialised for fetching
 * Daily Data Dumps.
 * @module nationscript/requests/dump
 */

/* === Imports === */

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const {
	NSRequest
} = require('./base');
const {
	NSError,
	VirtualError,
	DumpNotModifiedError
} = require('../errors');
const types = require('../types');

const Factory = require('../factory');
const DumpNation = require('../type/dump-nation');
const DumpRegion = require('../type/dump-region');
const DumpCard = require('../type/dump-card');

/**
 * @template ProductType
 * @callback DumpFactoryConstructor
 * @arg {Factory.FactoryDecider<ProductType>} decider
 * @returns {Factory.FactoryConstructor<ProductType[]>} DumpFactory constructor
 *     function bound to the provided `decider` function
 */
/**
 * @callback FileNamerNormal
 * Determines the expected name of the file containing the local copy of
 * the Nations/Regions Daily Data Dump for the given date.
 * @arg {Date} date Date of the Dump
 * @returns {string} Expected file name
 */
/**
 * @callback FileNamerCard
 * Determines the expected name of the file containing the local copy of
 * the Cards Seasonal Data Dump for the given season.
 * @arg {number} season Season of the Dump
 * @returns {string} Expected file name
 */


/* === Classes === */

/**
 * Superclass for all specialised request classes interacting with Daily Data
 * Dumps, including archived ones.
 */
class DumpRequest extends NSRequest {
	/**
	 * Path to the directory where fetched Data Dumps are saved to locally.
	 * @type {string}
	 * @default './nsdumps/'
	 * @static
	 * @protected
	 */
	static directory = path.join('.', 'nsdumps');

	/**
	 * Sets the {@link DumpRequest.directory directory} to keep local copies of
	 * fetched Data Dumps in.
	 * @arg {string} dir Path to the desired directory
	 * @returns {void}
	 * @throws {TypeError} if `dir` isn't a valid string
	 */
	static setDirectory(dir) {
		if(typeof dir !== 'string')
			throw new TypeError('Invalid path: ' + dir);
		if(!dir.endsWith('/')) dir += '/';
		DumpRequest.directory = path.normalize(dir);
	}

	constructor() {
		super();

		// If it doesn't exist yet, the base directory for the storage of local
		// dump copies is created
		if(!fs.existsSync(DumpRequest.directory))
			fs.mkdirSync(DumpRequest.directory);
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
	 * Creates a readable stream of the file that the path returned by the
	 * {@link DumpRequest#getFilePath} function points at. If a file does not
	 * exist on that path, `null` is returned.
	 * @returns {?fs.ReadStream} Readable stream of the file content, if found
	 * @private
	 */
	readLocal() {
		let file = this.getFilePath();
		if(fs.existsSync(file))
			return fs.createReadStream(file);
		return null;
	}

	/**
	 * Creates a writable stream targeting the file which the path returned by
	 * the {@link DumpRequest#getFilePath} function points at. If a file does
	 * not exist on that path yet, it is newly created for this purpose.
	 * @returns {fs.WriteStream} Writable stream targeting the file content
	 * @private
	 */
	writeLocal() {
		let file = this.getFilePath();
		if(fs.existsSync(file))
			return fs.createWriteStream(file);
		fs.writeFileSync(file, '');
		return fs.createWriteStream(file);
	}

	/**
	 * @returns {string} Path to the file which to save the local Dump copy as
	 * @virtual
	 * @protected
	 */
	getFilePath() {
		throw new VirtualError(this.getFilePath,
			this.constructor);
	}

	/**
	 * Gets the raw readable stream of the queried Dump data. The original
	 * stream - depending on the {@link DumpMode} used, either from the local
	 * Dump copy or the remote copy on the NationStates servers - is `pipe()`d
	 * first through a write stream to the local {@link DumpRequest#file file},
	 * if necessary, and in any case will finally be `pipe()`d through a
	 * `zlib.Gunzip` stream, which is the ultimate return value.
	 * @returns {Promise<zlib.Gunzip>} Stream of the fetched data, if found
	 * @override
	 */
	async getStream() {
		let read = null;
		let write = null;
		let file = this.getFilePath();

		switch(this.mode) {
			case DumpMode.DOWNLOAD:
				read = await this.raw();
				write = this.writeLocal();
				break;

			case DumpMode.DOWNLOAD_IF_CHANGED:
				read = this.readLocal();
				if(read) this.setHeader('If-Modified-Since', 
					formatDateHeader(fs.statSync(file).mtime));
				try {
					read = await this.raw();
					write = this.writeLocal();
				} catch(e) {
					if(!(e instanceof DumpNotModifiedError)) throw e;
				}
				break;

			case DumpMode.LOCAL:
				read = this.readLocal();
				break;

			case DumpMode.LOCAL_OR_DOWNLOAD:
				read = this.readLocal();
				if(read) break;
				read = await this.raw();
				write = this.writeLocal();
				break;

			case DumpMode.REMOTE:
				read = await this.raw();
				break;
		}
		if(!read) throw new NSError('Could not obtain dump data');
		if(write) read.pipe(write);
		return read.pipe(zlib.createGunzip());
	}

	/**
	 * Executes this request according to the set {@link DumpMode}.
	 * @returns {Promise<object[]>} All parsed objects satisfying the filter
	 * @override
	 */
	async send() {
		return await super.send();
	}
}

/**
 * Superclass for date-dependent Data Dump requests.
 */
class DateDumpRequest extends DumpRequest {
	/**
	 * @arg {Date} date Date to fetch the Dump for
	 */
	constructor(date) {
		super();
		this.setDate(date);
	}
	/**
	 * Date for which to get the Data Dump with this request.
	 * @type {Date}
	 * @protected
	 */
	date;

	/**
	 * Set the {@link DateDumpRequest#date date} for which to get the Dump.
	 * @arg {Date} date Date of the desired Dump
	 * @returns {this} The request, for chaining
	 */
	setDate(date) {
		if(date instanceof Date) this.date = date;
		return this;
	}
}

/**
 * Request subclass for reading Daily Data Dumps of nations.
 */
class NationDumpRequest extends DateDumpRequest {
	/**
	 * @type {FileNamerNormal}
	 * @package
	 */
	static filename = (date) => `nations_${formatDateDump(date)}.xml.gz`;

	/**
	 * @arg {Date} date Date to fetch the Dump for
	 */
	constructor(date) {
		super(date);
		let path = same(date, new Date())
			? 'pages/nations.xml.gz'
			: `archive/nations/${formatDateDump(date)}-nations-xml.gz`;
		this.setTargetURL('https://www.nationstates.net/' + path)
	}

	/** @inheritdoc */
	getFilePath() {
		return path.join(DumpRequest.directory,
			NationDumpRequest.filename(this.date));
	}

	/**
	 * @inheritdoc
	 * @arg {Factory.FactoryDecider<types.DumpNation>} filter
	 */
	setFilter(filter) {
		return super.setFilter(filter);
	}

	/**
	 * Only nations fulfilling the `filter` are returned.
	 * @returns {Promise<types.DumpNation[]>}
	 * @inheritdoc
	 */
	async send() {
		this.useFactory(DumpNation.createArray(this.filter))
		return await super.send();
	}
}

/**
 * Request subclass for reading Daily Data Dumps of regions.
 */
class RegionDumpRequest extends DateDumpRequest {
	/**
	 * @type {FileNamerNormal}
	 * @package
	 */
	static filename = (date) => `regions_${formatDateDump(date)}.xml.gz`;

	/**
	 * @arg {Date} date Date to fetch the Dump for
	 */
	constructor(date) {
		super(date);
		let path = same(date, new Date())
			? 'pages/regions.xml.gz'
			: `archive/regions/${formatDateDump(date)}-regions-xml.gz`;
		this.setTargetURL('https://www.nationstates.net/' + path);
	}

	/** @inheritdoc */
	getFilePath() {
		return path.join(DumpRequest.directory,
			RegionDumpRequest.filename(this.date));
	}

	/**
	 * @inheritdoc
	 * @arg {Factory.FactoryDecider<types.DumpRegion>} filter
	 */
	setFilter(filter) {
		return super.setFilter(filter);
	}

	/**
	 * Only regions fulfilling the `filter` are returned.
	 * @returns {Promise<types.DumpRegion[]>}
	 * @inheritdoc
	 */
	async send() {
		this.useFactory(DumpRegion.createArray(this.filter))
		return await super.send();
	}
}

/**
 * Request subclass for reading seasonal Data Dumps of cards.
 */
class CardDumpRequest extends DumpRequest {
	/**
	 * @type {FileNamerCard}
	 * @package
	 */
	static filename = (season) => `cards_s${season}.xml.gz`;

	/**
	 * Season to get the Data Dump of with this request
	 * @type {number}
	 * @private
	 */
	season = 3;

	/**
	 * @arg {number} season Season to request the Data Dump of
	 */
	constructor(season) {
		super();
		let path = `pages/cardlist_S${season}.xml.gz`
		this.setTargetURL('https://www.nationstates.net/' + path);
		this.season = season;
	}

	/** @inheritdoc */
	getFilePath() {
		return path.join(DumpRequest.directory,
			CardDumpRequest.filename(this.season));
	}

	/**
	 * @inheritdoc
	 * @arg {Factory.FactoryDecider<types.DumpCard>} filter
	 */
	setFilter(filter) {
		return super.setFilter(filter);
	}

	/**
	 * Only cards fulfilling the `filter` are returned.
	 * @returns {Promise<types.DumpCard[]>}
	 * @inheritdoc
	 */
	async send() {
		this.useFactory(DumpCard.createArray(this.filter))
		return await super.send();
	}
}

/**
 * Supported ways of getting Daily Data Dump contents.
 * @enum {number}
 */
const DumpMode = {
	/**
	 * Download the Dump and read it. Makes **one** API request.
	 */
	DOWNLOAD: 0,

	/**
	 * Download the Dump only if it is newer than the local copy or a local
	 * copy doesn't exist. Whichever of the two is newer is read. Makes **one**
	 * API request.
	 */
	DOWNLOAD_IF_CHANGED: 1,

	/**
	 * Read the local copy of the Dump. If none exists, the request fails.
	 * Makes **no** API requests.
	 */
	LOCAL: 2,

	/**
	 * Read the local copy of the Dump; if none exists, download the Dump. If
	 * a download is initiated, **one** API request is made, otherwise **none**
	 * are.
	 */
	LOCAL_OR_DOWNLOAD: 3,

	/**
	 * Read the Dump from the NS servers without creating a local copy. Makes
	 * **one** API request.
	 */
	REMOTE: 4
};

/* === Date Handling === */
// Or, Why is there no a generic pattern-based date formatter like in Java? :(

/**
 * Ensures that the given number, presented as `string`, spans two digits by
 * prefixing values below `10` with an additional `'0'`.
 * @arg {number} num Number to modify
 * @returns {string} The number as string, if necessary prefixed with a `'0'`
 * @ignore
 */
function twoDigit(num) {
	return num >= 10 ? num.toString() : '0' + num;
}

/**
 * Formats the given date into a string of the format `YYYY-MM-DD`.
 * @arg {Date} date Date to format
 * @returns {string} The formatted string
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
 * Formats the given date into a string usable for the `If-Modified-Since` HTTP
 * request header.
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
 * @arg {Date} date1 First `Date`
 * @arg {Date} date2 Second `Date`
 * @returns {boolean} `true` if the `Date`s are on the same day, `false` if not
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
exports.DumpMode = DumpMode;
