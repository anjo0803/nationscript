/**
 * The Command module contains command functionality targeting the nations endpoint of the API.
 * @module requests/command
 * @license {@linkplain https://mozilla.org/MPL/2.0/ MPL-2.0}
 */

const { txt } = require('./converter');

const { DispatchSubcategory } = require('../enums');

const {
	NSRequest,
	ParameterRequest,
	NSCredential,
	nsify
} = require('./base');

const { IssueEffect, parseIssueEffect } = require('../typedefs/issue-effect');

/**
 * Superclass for all nation private command request instances.
 * 
 * Stores the login credentials and pre-defines the root tag of the result XML, since all
 * commands return their results in `<NATION>` tags.
 * 
 * **Intended for internal use only!**
 */
class CommandRequest extends ParameterRequest {
	/**
	 * The login credentials for the nation that should execute the command.
	 * @type NSCredential
	 */
	#credentials;

	constructor(credentials, ...required) {
		super('nation', 'c', ...required);    // Use the nation name from the provided credentials
		this.setArgument('nation', nsify(credentials?.nation));
		this.#credentials = credentials;
	}

	/**
	 * Gets the login credentials currently set for this request.
	 * @returns {NSCredential} The login credentials.
	 */
	getCredentials() {
		return this.#credentials;
	}

	/**
	 * Executes this command by invoking {@linkcode NSRequest.send()} with
	 * the result root tag to look for pre-defined as `<NATION>`.
	 */
	async send() {
		return await super.send('NATION');
	}
}

/**
 * Superclass for all instances of nation private command requests where the command requires two
 * steps for execution - one HTTP request in preparation and one in execution mode.
 * 
 * Defines the `mode` argument as required and sets it to `'prepare'` for the initial request.
 * Overrides {@linkcode CommandRequest.send()} to accomodate to the two-step process.
 * 
 * **Intended for internal use only!**
 */
class TwoStepCommand extends CommandRequest {
	constructor(credentials, ...required) {
		super(credentials, 'mode', ...required);
		this.setArgument('mode', 'prepare');
	}

	/**
	 * Fully executes the command - sends one request to the API in preparation mode, and,
	 * if an execution token was returned, another right after in execution mode.
	 */
	async send() {
		let token = txt(await super.send(), 'SUCCESS');
		if (token) {
			this.setArgument('token', token)
				.setArgument('mode', 'execute');
			return await super.send();
		} else throw new Error('Command preparation failed - no execution token obtained')
	}
}

/**
 * Request subclass for building and customizing requests to the commands endpoint of the API,
 * specifically for executing the `c=issue` nation private command.
 */
class IssueCommand extends CommandRequest {
	constructor(issue, credentials) {
		super(credentials, 'issue', 'option');
		this.setArgument('c', 'issue')
			.setArgument('issue', issue);
	}

	/**
	 * Defines the option that should be selected when answering the issue.
	 * @param {number} option ID of the chosen option of the issue.
	 * @returns {this} The command, for chaining.
	 */
	answer(option) {
		return this.setArgument('option', option);
	}

	/**
	 * Sets the issue to be dismissed, instead of choosing one of its options.
	 * Identical to `answer(-1)`.
	 * @returns {this} The command, for chaining.
	 */
	dismiss() {
		return this.setArgument('option', '-1');
	}

	/**
	 * Executes this command, sending an HTTP request with all data specified in this
	 * instance to the API and parsing its response.
	 * @returns {IssueEffect} The effects of the chosen answer to the issue.
	 */
	async send() {
		return parseIssueEffect((await super.send())?.['ISSUE']);
	}
}

/**
 * Request subclass for building and customizing requests to the commands endpoint of the API,
 * specifically for executing the `c=giftcard` nation private command.
 */
class GiftCardCommand extends TwoStepCommand {
	constructor(recipient, credentials) {
		super(credentials, 'cardid', 'season', 'to');
		this.setArgument('c', 'giftcard')
			.setArgument('to', nsify(recipient));
	}

	/**
	 * Defines the trading card to send by its ID and season.
	 * @param {number} id ID of the card to send; equal to the database ID of the nation depicted.
	 * @param {number} season Season number of the card.
	 * @returns {this} The command, for chaining.
	 */
	setCard(id, season) {
		return this.setArgument('cardid', id)
			.setArgument('season', season);
	}

	/**
	 * Executes this command, sending two HTTP requests with all data specified in this instance to
	 * the API (once in preparation, once in execution mode) and parses its response.
	 * @returns {number | null} The amount of bank paid for gifting, or `null` if gifting failed.
	 */
	async send() {
		let res = await super.send();
		if(res['SUCCESS']) return parseInt(res['SUCCESS'][0].replace(/[^0-9\.]+/, ''));
		else return null;
	}
}

/**
 * Superclass for the {@linkcode DispatchAddCommand}, {@linkcode DispatchEditCommand} and
 * {@linkcode DispatchDeleteCommand} commands.
 * 
 * Defines the `c` argument and registers the `dispatch` argument as required at instantiation,
 * but that's it.
 * 
 * **Intended for internal use only!**
 */
class DispatchCommand extends TwoStepCommand {
	constructor(credentials, ...required) {
		super(credentials, 'dispatch', ...required);
		this.setArgument('c', 'dispatch');
	}
}

/**
 * Request subclass for building and customizing requests to the commands endpoint of the API,
 * specifically for executing the `c=dispatch` nation private command with `dispatch=add`.
 */
class DispatchAddCommand extends DispatchCommand {
	constructor(credentials, ...required) {
		super(credentials, 'title', 'text', 'category', 'subcategory', ...required);
		this.setArgument('dispatch', 'add');
	}

	/**
	 * Defines the title that the dispatch should bear.
	 * @param {string} title The desired title.
	 * @returns {this} The command, for chaining.
	 */
	setTitle(title) {
		return this.setArgument('title', win1252Workaround(title));
	}

	/**
	 * Defines the text content that the dispatch should have.
	 * @param {string} content The desired body text.
	 * @returns {this} The command, for chaining.
	 */
	setContent(content) {
		return this.setArgument('text', win1252Workaround(content));
	}

	/**
	 * Defines the category and subcategory that the dispatch should be put in.
	 * @param {string} category The desired {@linkcode DispatchSubcategory} to put the dispatch in.
	 * @returns {this} The command, for chaining.
	 */
	setCategory(category) {
		let cat, sub;
		switch(category) {
			case DispatchSubcategory.FACTBOOK.OVERVIEW:		cat = 1; sub = 100; break;
			case DispatchSubcategory.FACTBOOK.HISTORY:		cat = 1; sub = 101; break;
			case DispatchSubcategory.FACTBOOK.GEOGRAPHY:	cat = 1; sub = 102; break;
			case DispatchSubcategory.FACTBOOK.CULTURE:		cat = 1; sub = 103; break;
			case DispatchSubcategory.FACTBOOK.POLITICS:		cat = 1; sub = 104; break;
			case DispatchSubcategory.FACTBOOK.LEGISLATION:	cat = 1; sub = 105; break;
			case DispatchSubcategory.FACTBOOK.RELIGION:		cat = 1; sub = 106; break;
			case DispatchSubcategory.FACTBOOK.MILITARY:		cat = 1; sub = 107; break;
			case DispatchSubcategory.FACTBOOK.ECONOMY:		cat = 1; sub = 108; break;
			case DispatchSubcategory.FACTBOOK.INTERNATIONAL:cat = 1; sub = 109; break;
			case DispatchSubcategory.FACTBOOK.TRIVIA:		cat = 1; sub = 110; break;
			case DispatchSubcategory.FACTBOOK.MISCELLANEOUS:cat = 1; sub = 111; break;

			case DispatchSubcategory.BULLETIN.POLICY:	cat = 3; sub = 305; break;
			case DispatchSubcategory.BULLETIN.NEWS:		cat = 3; sub = 315; break;
			case DispatchSubcategory.BULLETIN.OPINION:	cat = 3; sub = 325; break;
			case DispatchSubcategory.BULLETIN.CAMPAIGN:	cat = 3; sub = 385; break;

			case DispatchSubcategory.ACCOUNT.MILITARY:	cat = 5; sub = 505; break;
			case DispatchSubcategory.ACCOUNT.TRADE:		cat = 5; sub = 515; break;
			case DispatchSubcategory.ACCOUNT.SPORT:		cat = 5; sub = 525; break;
			case DispatchSubcategory.ACCOUNT.DRAMA:		cat = 5; sub = 535; break;
			case DispatchSubcategory.ACCOUNT.DIPLOMACY:	cat = 5; sub = 545; break;
			case DispatchSubcategory.ACCOUNT.SCIENCE:	cat = 5; sub = 555; break;
			case DispatchSubcategory.ACCOUNT.CULTURE:	cat = 5; sub = 565; break;
			case DispatchSubcategory.ACCOUNT.OTHER:		cat = 5; sub = 595; break;

			case DispatchSubcategory.META.GAMEPLAY:		cat = 8; sub = 835; break;
			case DispatchSubcategory.META.REFERENCE:	cat = 8; sub = 845; break;

			default: cat = 8; sub = 845; break;
		}
		return this.setArgument('category', cat).setArgument('subcategory', sub);
	}

	/**
	 * Executes this command, sending two HTTP requests with all data specified in this instance to
	 * the API (once in preparation, once in execution mode) and parses its response.
	 * @returns {number | null} The ID of the newly posted dispatch, or `null` if posting failed.
	 */
	async send() {
		let res = await super.send();
		if(res['SUCCESS']) return parseInt(res['SUCCESS'][0].replace(/\D*/, ''));
		else return null;
	}
}

/**
 * Request subclass for building and customizing requests to the commands endpoint of the API,
 * specifically for executing the `c=dispatch` nation private command with `dispatch=edit`.
 */
class DispatchEditCommand extends DispatchAddCommand {
	constructor(credentials) {
		super(credentials, 'dispatchid');
		this.setArgument('dispatch', 'edit');
	}

	/**
	 * Defines the dispatch that is to be edited.
	 * @param {number} id ID of the dispatch on NationStates.
	 * @returns {this} The command, for chaining.
	 */
	targetDispatch(id) {
		return this.setArgument('dispatchid', id);
	}

	/**
	 * Executes this command, sending two HTTP requests with all data specified in this instance to
	 * the API (once in preparation, once in execution mode) and interprets its response.
	 * @returns {boolean} `true` if the edit was successful, otherwise `false`.
	 */
	async send() {
		let res = await super.send();
		return typeof res === 'number';
	}
}

/**
 * Request subclass for building and customizing requests to the commands endpoint of the API,
 * specifically for executing the `c=dispatch` nation private command with `dispatch=remove`.
 */
class DispatchDeleteCommand extends DispatchCommand {
	constructor(credentials) {
		super(credentials, 'dispatchid');
		this.setArgument('dispatch', 'remove');
	}

	/**
	 * Defines the dispatch that should be deleted.
	 * @param {number} id ID of the dispatch on NationStates.
	 * @returns {this} The command, for chaining.
	 */
	targetDispatch(id) {
		return this.setArgument('dispatchid', id);
	}

	/**
	 * Executes this command, sending two HTTP requests with all data specified in this instance to
	 * the API (once in preparation, once in execution mode) and parses its response.
	 * @returns {boolean} `true` if deletion was successful, otherwise `false`.
	 */
	async send() {
		let res = await super.send();
		if(res['SUCCESS']) return true;
		else return false;
	}
}

/**
 * Request subclass for building and customizing requests to the commands endpoint of the API,
 * specifically for executing the `c=rmbpost` nation private command.
 * 
 * **Currently undocumented in the official API docs.**
 */
class RMBPostCommand extends TwoStepCommand {
	constructor(region, message, credential) {
		super(credential, 'region', 'text');
		this.setArgument('c', 'rmbpost')
			.setArgument('region', nsify(region))
			.setArgument('text', win1252Workaround(message));
	}

	/**
	 * Executes this command, sending two HTTP requests with all data specified in this instance to
	 * the API (once in preparation, once in execution mode) and parses its response.
	 * @returns {number | null} The ID of the newly created RMB post, or `null` if posting failed.
	 */
	async send() {
		let res = await super.send('NATION');
		if(res['SUCCESS']) return parseInt(res['SUCCESS'][0].replace(/.*?(\d+).*/, '$1'));
		else return null;
	}
}

/**
 * Because the NS API uses Windows-1252 encoding for RMB Posts and dispatches even when specifying
 * `charset=utf-8`, which spells trouble for e.g. emojis included in them, but
 * [seems to accept](https://forum.nationstates.net/viewtopic.php?p=40128315#p40128315) XML
 * entities, this method provides a workaround for that issue until the API accepts regular UTF-8.
 * 
 * Yes I know it's not exactly orthodox :P
 * @param {string} str String to encode.
 * @returns {string} The given string, encoded to be passed to the NS API. 
 */
function win1252Workaround(str) {
	let ret = '';
	for(let c of str) {
		let code = c.codePointAt(0);
		if(code > 126)	// Don't escape standard (latin) characters, as this would mess up BBCode
			ret += `&#${c.codePointAt(0)};`;
		else ret += c;
	}
	return encodeURIComponent(ret);	// Finally, ensure proper general URI encoding
}

exports.IssueCommand = IssueCommand;
exports.GiftCardCommand = GiftCardCommand;
exports.DispatchAddCommand = DispatchAddCommand;
exports.DispatchEditCommand = DispatchEditCommand;
exports.DispatchDeleteCommand = DispatchDeleteCommand;
exports.RMBPostCommand = RMBPostCommand;
