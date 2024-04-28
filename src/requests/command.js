/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	DataRequest,
	NSCredential,
	toIDForm
} = require('./base');
const {
	DispatchCategory,
	DispatchSubcategory
} = require('../enums');
const {
	PropertyMissingError,
	NSError
} = require('../errors');

const {
	NSFactory,
	createError
} = require('../factory');
const IssueEffect = require('../type/issue-effect');


/**
 * Request subclass for building requests to the commands endpoint of the API.
 * 
 * Stores the login credential and ensures it is sent together with the request
 * and the {@link NSCredential#pin pin} stays up-to-date.
 */
class CommandRequest extends DataRequest {
	/**
	 * {@link DataRequest#mandate mandate}s the `nation` and `c` arguments.
	 */
	constructor() {
		super();
		this.mandate('nation', 'c');
	}

	/**
	 * Login credential for the nation this command should be executed as.
	 * @type {?NSCredential}
	 * @private
	 */
	credential = null;

	/**
	 * Provide a login credential for the nation to execute this command as.
	 * @arg {NSCredential} credential Login credential to use
	 * @returns {this} The request, for chaining
	 */
	authenticate(credential) {
		if(!(credential instanceof NSCredential))
			throw TypeError('Invalid credential: ' + credential);

		// Infer the command's target nation from the provided credential
		if(!credential.nation)
			throw new PropertyMissingError('nation', 'NSCredential');
		this.setArgument('nation', toIDForm(credential.nation));

		if(credential.password)
			this.setHeader('X-Password', credential.password);
		if(credential.autologin)
			this.setHeader('X-Autologin', credential.autologin);
		if(credential.pin)
			this.setHeader('X-Pin', credential.pin);

		this.credential = credential;
		return this;
	}

	/**
	 * For a stored {@link CommandRequest#credential credential}, the
	 * {@link NSCredential#updateFromResponse} method is invoked with the
	 * received response headers.
	 * @inheritdoc
	 */
	async raw() {
		let ret = await super.raw();
		this.credential?.updateFromResponse(ret.headers);
		return ret;
	}
}

/**
 * Request subclass for building requests to the commands endpoint of the API
 * where the ultimate execution of the represented command must happen in a
 * two-step process - one HTTP request having to be made in preparation mode,
 * and another one in execution mode, using an execution token obtained from
 * that first request.
 */
class TwoStepCommand extends CommandRequest {
	/**
	 * Additionally {@link DataRequest#mandate mandate}s the `mode` argument.
	 */
	constructor() {
		super();
		this.mandate('mode')
			.setArgument('mode', 'prepare');
	}

	/**
	 * @inheritdoc
	 * @returns {Promise<string>} Content of the returned `<SUCCESS>` tag
	 */
	async send() {
		// First, send this command in prepare mode
		this.setArgument('mode', 'prepare')
			// Everything is returned within <NATION> tags
			.useFactory((root) => new NSFactory().onTag('NATION', (me) => me
				.build('')
				.assignSubFactory(new NSFactory()
					// Both the execution token and the ultimate result of
					// execution are returned within <SUCCESS> tags
					.onTag('SUCCESS', (me) => me.build(''))

					// If there is an internal error, the error message is
					// ususally within <ERROR> tags, but can also be in a <div>
					.onTag('div', createError)
					.onTag('ERROR', createError)
				)));

		let ret = await super.send();
		if(typeof ret !== 'string')
			throw new NSError('Failed to obtain command execution token');

		// Switch to execution mode, send again and return the result
		this.setArgument('token', ret)
			.setArgument('mode', 'execute');
		return await super.send();
	}
}

/**
 * Request subclass for building requests to the commands endpoint of the API,
 * specifically for executing the `c=issue` nation private command.
 */
class IssueCommand extends CommandRequest {
	/**
	 * Additionally {@link DataRequest#mandate mandate}s the `issue` and
	 * `option` arguments and sets the `c` argument.
	 */
	constructor() {
		super();
		this.mandate('issue', 'option')
			.setArgument('c', 'issue');
	}

	/**
	 * Define the issue to answer via this command.
	 * @arg {number} issue ID of the issue to address
	 * @returns {this} The command, for chaining
	 */
	setIssue(issue) {
		return this.setArgument('issue', issue);
	}

	/**
	 * Set the option that will be chosen on the issue.
	 * @arg {number} option ID of the option to choose; `-1` to dismiss
	 * @returns {this} The command, for chaining
	 */
	setOption(option = -1) {
		return this.setArgument('option', option);
	}

	/**
	 * @inheritdoc
	 * @returns {Promise<IssueEffect.IssueEffect>}
	 */
	async send() {
		this.useFactory(() => new NSFactory()
			// The actual result is also wrapped in a <NATION> tag
			.onTag('NATION', (me, attrs) => me
				.build('')
				.assignSubFactory(new NSFactory()
					.onTag('ISSUE', (me, attrs) => me
						.assignSubFactory(IssueEffect.create(attrs)))
					.onTag('ERROR', createError))));
		return await super.send();
	}
}

/**
 * Request subclass for building requests to the commands endpoint of the API,
 * specifically for executing the `c=giftcard` nation private command.
 */
class GiftCardCommand extends TwoStepCommand {
	/**
	 * Additionally {@link DataRequest#mandate mandate}s the `cardid`, `to`,
	 * and `season` arguments and sets the `c` argument.
	 */
	constructor() {
		super();
		this.mandate('cardid', 'season', 'to')
			.setArgument('c', 'giftcard');
	}

	/**
	 * Define the trading card to send by its card ID and season.
	 * @arg {number} id ID of the card to send
	 * @arg {number} season Season ID of the card
	 * @returns {this} The command, for chaining
	 */
	setCard(id, season) {
		return this.setArgument('cardid', id)
			.setArgument('season', season);
	}

	/**
	 * Define the nation that should receive the trading card.
	 * @arg {string} name Name of the recipient
	 * @returns {this} The command, for chaining
	 */
	setRecipient(name) {
		return this.setArgument('to', toIDForm(name));
	}
}

/**
 * Request subclass for building requests to the commands endpoint of the API,
 * specifically for executing the `c=dispatch` nation private command; only
 * serves as a layer of abstraction for the {@link DispatchAddCommand},
 * {@link DispatchEditCommand}, and {@link DispatchDeleteCommand} classes.
 */
class DispatchCommand extends TwoStepCommand {
	/**
	 * Additionally {@link DataRequest#mandate mandate}s the `dispatch`
	 * argument and sets the `c` argument.
	 */
	constructor() {
		super();
		this.mandate('dispatch')
			.setArgument('c', 'dispatch');
	}
}

/**
 * Request subclass for building requests to the commands endpoint of the API,
 * specifically for executing the `c=dispatch` nation private command with the
 * `dispatch=add` sub-command.
 */
class DispatchAddCommand extends DispatchCommand {
	/**
	 * Additionally {@link DataRequest#mandate mandate}s the `title`, `text`,
	 * `category`, and `subcategory` arguments and sets the `c` argument.
	 */
	constructor() {
		super();
		this.mandate('title', 'text', 'category', 'subcategory')
			.setArgument('dispatch', 'add');
	}

	/**
	 * Set the title that the dispatch should bear.
	 * @arg {string} title The desired title
	 * @returns {this} The command, for chaining
	 */
	setTitle(title) {
		return this.setArgument('title', win1252Workaround(title));
	}

	/**
	 * Set the text content that the dispatch should have.
	 * @arg {string} content The desired body text
	 * @returns {this} The command, for chaining
	 */
	setContent(content) {
		return this.setArgument('text', win1252Workaround(content));
	}

	/**
	 * Set the {@link DispatchCategory} and {@link DispatchSubcategory} that
	 * the dispatch should be put in.
	 * @arg {string} category Desired category
	 * @arg {string} subcategory Desired subcategory
	 * @returns {this} The command, for chaining
	 */
	setCategory(category, subcategory) {
		let sub = translateSubcategory(category, subcategory);
		return this
			.setArgument('category', sub / 100)
			.setArgument('subcategory', sub);
	}
}

/**
 * Request subclass for building requests to the commands endpoint of the API,
 * specifically for executing the `c=dispatch` nation private command with the
 * `dispatch=edit` sub-command.
 */
class DispatchEditCommand extends DispatchAddCommand {
	/**
	 * Additionally {@link DataRequest#mandate mandate}s the `dispatchid`
	 * argument and sets the `dispatch` argument.
	 */
	constructor() {
		super();
		this.mandate('dispatchid')
			.setArgument('dispatch', 'edit');
	}

	/**
	 * Define the dispatch that is to be edited.
	 * @arg {number} id Target dispatch ID
	 * @returns {this} The command, for chaining
	 */
	targetDispatch(id) {
		return this.setArgument('dispatchid', id);
	}
}

/**
 * Request subclass for building requests to the commands endpoint of the API,
 * specifically for executing the `c=dispatch` nation private command with the
 * `dispatch=remove` sub-command.
 */
class DispatchDeleteCommand extends DispatchCommand {
	/**
	 * Additionally {@link DataRequest#mandate mandate}s the `dispatchid`
	 * argument and sets the `dispatch` argument.
	 */
	constructor() {
		super();
		this.mandate('dispatchid')
			.setArgument('dispatch', 'remove');
	}

	/**
	 * Define the dispatch that should be deleted
	 * @arg {number} id Target dispatch ID
	 * @returns {this} The command, for chaining
	 */
	targetDispatch(id) {
		return this.setArgument('dispatchid', id);
	}
}

/**
 * Request subclass for building requests to the commands endpoint of the API,
 * specifically for executing the `c=rmbpost` nation private command.
 * 
 * **Currently undocumented in the official API docs.**
 */
class RMBPostCommand extends TwoStepCommand {
	/**
	 * Additionally {@link DataRequest#mandate mandate}s the `region` and
	 * `text` arguments and sets the `c` argument.
	 */
	constructor() {
		super();
		this.mandate('region', 'text')
			.setArgument('c', 'rmbpost');
	}

	/**
	 * Define the region on whose RMB the post should be lodged.
	 * @arg {string} region Name of the target region
	 * @returns {this} The command, for chaining
	 */
	setRegion(region) {
		return this.setArgument('region', toIDForm(region));
	}

	/**
	 * Set the body text of the post to lodge.
	 * @arg {string} text Text to post
	 * @returns {this} The command, for chaining
	 */
	setText(text) {
		return this.setArgument('text', win1252Workaround(text));
	}
}

/**
 * Translates a given {@link DispatchCategory} and {@link DispatchSubcategory}
 * from their textual forms to the corresponding numerical subcategory ID.
 * The category ID can be extracted from this via (floored) division by `100`.
 * @arg {string} category Top-level category to translate
 * @arg {string} subcategory Subcategory to translate
 * @returns {number} Translated subcategory code
 */
function translateSubcategory(category, subcategory) {
	switch(category) {
		case DispatchCategory.FACTBOOK: switch(subcategory) {
			case DispatchSubcategory.FACTBOOK.OVERVIEW:		return 100;
			case DispatchSubcategory.FACTBOOK.HISTORY:		return 101;
			case DispatchSubcategory.FACTBOOK.GEOGRAPHY:	return 102;
			case DispatchSubcategory.FACTBOOK.CULTURE:		return 103;
			case DispatchSubcategory.FACTBOOK.POLITICS:		return 104;
			case DispatchSubcategory.FACTBOOK.LEGISLATION:	return 105;
			case DispatchSubcategory.FACTBOOK.RELIGION:		return 106;
			case DispatchSubcategory.FACTBOOK.MILITARY:		return 107;
			case DispatchSubcategory.FACTBOOK.ECONOMY:		return 108;
			case DispatchSubcategory.FACTBOOK.INTERNATIONAL:return 109;
			case DispatchSubcategory.FACTBOOK.TRIVIA:		return 110;
			case DispatchSubcategory.FACTBOOK.MISCELLANEOUS:return 111;
			default: return NaN;
		}
		case DispatchCategory.BULLETIN: switch(subcategory) {
			case DispatchSubcategory.BULLETIN.POLICY:		return 305;
			case DispatchSubcategory.BULLETIN.NEWS:			return 315;
			case DispatchSubcategory.BULLETIN.OPINION:		return 325;
			case DispatchSubcategory.BULLETIN.CAMPAIGN:		return 385;
			default: return NaN;
		}
		case DispatchCategory.ACCOUNT: switch(subcategory) {
			case DispatchSubcategory.ACCOUNT.MILITARY:		return 505;
			case DispatchSubcategory.ACCOUNT.TRADE:			return 515;
			case DispatchSubcategory.ACCOUNT.SPORT:			return 525;
			case DispatchSubcategory.ACCOUNT.DRAMA:			return 535;
			case DispatchSubcategory.ACCOUNT.DIPLOMACY:		return 545;
			case DispatchSubcategory.ACCOUNT.SCIENCE:		return 555;
			case DispatchSubcategory.ACCOUNT.CULTURE:		return 565;
			case DispatchSubcategory.ACCOUNT.OTHER:			return 595;
			default: return NaN;
		}
		case DispatchCategory.META: switch(subcategory) {
			case DispatchSubcategory.META.GAMEPLAY:			return 835;
			case DispatchSubcategory.META.REFERENCE:		return 845;
			default: return NaN;
		}
		default: return NaN;
	}
}

/**
 * Because the NS API uses Windows-1252 encoding for RMB Posts and dispatches
 * even when specifying `charset=utf-8` in the `POST` request - which spells
 * big trouble for e.g. emojis or other exotic Unicode included in them, but
 * [accepts](https://forum.nationstates.net/viewtopic.php?p=40128315#p40128315)
 * encoding via XML entities, this method provides a workaround for that issue
 * until the API accepts regular UTF-8.
 * 
 * Yes I know it's not exactly orthodox :P
 * @arg {string} str String to encode.
 * @returns {string} The given string, encoded to be passed to the NS API.
 * @ignore
 */
function win1252Workaround(str) {
	let ret = '';
	for(let c of str) {
		let code = c.codePointAt(0) ?? 0;
		if(code > 126)	// Escaping standard latin chars would mess up BBCode
			ret += `&#${code};`;
		else ret += c;
	}
	return encodeURIComponent(ret);	// Finally, ensure general URI encoding
}

exports.IssueCommand = IssueCommand;
exports.GiftCardCommand = GiftCardCommand;
exports.DispatchAddCommand = DispatchAddCommand;
exports.DispatchEditCommand = DispatchEditCommand;
exports.DispatchDeleteCommand = DispatchDeleteCommand;
exports.RMBPostCommand = RMBPostCommand;
