/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSError,
	ProductWithheldError,
	FactoryFinalisedError
} = require('./errors');

/**
 * @callback DataConverter
 * Contains an operation to be performed on the passed value. This might be a
 * conversion of a string to a number, the creation of a new class instance
 * on the basis of asynchronously created data, or anything, really.
 * @arg {any} val Value to operate on
 * @return {boolean|string|number|object} The result of the conversion
 */

/**
 * @callback TagHandler
 * 
 * @arg {NSFactory} me `this` of the factory from which the handler is called
 * @arg {Attributes} attrs Key-value pairs of the tag's attributes
 * @return {void}
 * @todo
 */

/**
 * @typedef {Object.<string, string>} Attributes
 */

/**
 * The basic factory class, containing functions for the handling of events
 * emitted by the XML parser on the responses from the NationStates API.
 * 
 * Each factory builds exactly one instance of its configured
 * {@link NSFactory#product product}. One at a time, the factory targets each
 * {@link NSFactory#property property} of its `product`, using events passed
 * by the XML parser to build values from text {@link NSFactory#data data}
 * by itself, or alternatively passing the events further along to an assigned
 * {@link NSFactory#subFactory subFactory}, which can use them to build its own
 * `product`, later to be used by the parent factory as a property.
 * 
 * Data is received from the parser over the following events:
 * - {@link NSFactory#onOpen}
 * - {@link NSFactory#onClose}
 * - {@link NSFactory#onText}
 * - {@link NSFactory#onCData}
 * 
 * Upon receiving an `onOpen()` call, the factory checks whether its registered
 * {@link NSFactory#cases cases} cover the associated XML node's name. If not,
 * If so, the factory will {@link NSFactory#ignore ignore} that XML node, so
 * that no events are acted upon until an `onClose()` call is received for the
 * ignored node. If the `cases` cover the node, any associated handler function
 * is executed with the received attributes as argument.
 * 
 * For a non-ignored node, the factory requires a `subFactory` for handling. If
 * one is not assigned via the associated `cases` function(s), the factory will
 * assign itself a "blank" factory - without any `cases`. While a `subFactory`
 * is assigned, any and all events passed to a factory will be handed further
 * down to the `subFactory`.
 * 
 * When an `onText()` or `onCData()` event is received, a factory will append
 * the passed text or CDATA to its collected `data`.
 * 
 * A factory continues to develop its `product` until an `onClose()` event is
 * received, and no `subFactory` exists. At that point, the factory will add
 * any collected text `data` to its `product`, after which it is declared to be
 * {@link NSFactory#finalised finalised}. From that point on, the factory can
 * {@link NSFactory#deliver} the `product`.
 * @summary Class for handling data from events emitted during XML parsing.
 * @template ProductType Type of this factory's `product`
 */
class NSFactory {

	/**
	 * What this factory is producing. Properties are gradually built up from
	 * data contained in events passed to this factory by the XML parser.
	 * @type {*}
	 * @protected
	 */
	product = {};

	/**
	 * Name of the property of the {@link NSFactory#product product} that is
	 * currently being built. If it is empty, the whole `product` itself will
	 * be set to calculated property values.
	 * @type {string}
	 * @private
	 * @default
	 */
	property = '';

	/**
	 * Combined content of any text nodes handled by this factory. If no text
	 * node has been encountered yet, `null`.
	 * @type {string|null}
	 * @private
	 */
	data = null;

	/**
	 * Function to pass a value through before assigning it to the target
	 * {@link NSFactory#property property}.
	 * @type {DataConverter}
	 * @private
	 */
	convert = (val) => val;

	/**
	 * Sub-factory currently assigned to handle events passed to this factory.
	 * If none is assigned, `null`.
	 * @type {NSFactory|null}
	 * @see {@link NSFactory#assignSubFactory}
	 * @see {@link NSFactory#emptySubFactory}
	 * @private
	 * @default
	 */
	subFactory = null;

	/**
	 * 
	 * `true` if this factory has received an {@link NSFactory#onClose} call
	 * for the tag it was originally opened for (and its
	 * {@link NSFactory#product product} should accordingly be considered to be
	 * final), otherwise `false`.
	 * @type {boolean}
	 * @protected
	 */
	finalised = false;

	/**
	 * The tag names of all XML nodes this factory is expected to process. Each
	 * registered tag name has an array of handler functions as its value. Upon
	 * receiving an {@link NSFactory#onOpen} call for a registered tag name,
	 * all associated handler functions are invoked with the attributes present
	 * on the corresponding XML node passed as argument.
	 * @type {Object.<string, TagHandler[]>}
	 * @private
	 */
	cases = {};

	/**
	 * Name of the currently ignored node in the source XML. If no node is
	 * currently being ignored, this is an empty `string`.
	 * @type {string}
	 * @private
	 */
	ignore = '';

	/**
	 * Requests this factory to deliver its {@link NSFactory#product product}.
	 * Should it not be {@link NSFactory#finalised finalised} yet, the factory
	 * will withhold the `product`.
	 * @returns {ProductType} The `product`.
	 * @throws {ProductWithheldError} The `product` must be `finalised`!
	 * @public
	 */
	deliver() {
		if(!this.finalised) throw new ProductWithheldError();
		return this.product;
	}

	/**
	 * Configures this factory to build the {@link NSFactory#property property}
	 * of the given `name` on its {@link NSFactory#product product} next. This
	 * also sets the function to {@link NSFactory#convert convert} the
	 * calculated value before finally assigning it to the `product`.
	 * @arg {string} name New target `property`
	 * @arg {DataConverter} convert New converter function
	 * @returns {this} The factory, for chaining
	 * @public
	 */
	build(name, convert = (val) => val) {
		if(typeof name !== 'string')
			throw new TypeError('Invalid target product property:' + name);
		if(typeof convert !== 'function')
			throw new TypeError('Invalid property converter: ' + convert);

		this.property = name;
		this.convert = convert;
		return this;
	}

	/**
	 * Sets the given value as the given {@link NSFactory#property property} on
	 * the {@link NSFactory#product product} directly. Shortcut for
	 * {@link NSFactory#build buildProperty(name)}`.`
	 * {@link NSFactory#addToProduct addToProduct(value)}.
	 * @arg {string} name Name of target `property`
	 * @arg {any} value Value to assign
	 * @returns {this} The factory, for chaining
	 * @public
	 */
	set(name, value) {
		this.build(name)
			.addToProduct(value);
		return this;
	}

	/**
	 * Assigns the given value to the {@link NSFactory#property property} that
	 * is currently being targeted on the {@link NSFactory#product product}. If
	 * an empty name is targeted, the `product` as a whole is set to `val`.
	 * @arg {any} val Value to assign
	 * @returns {void}
	 * @protected
	 */
	addToProduct(val) {
		let add = this.convert(val);
		if(this.property.length === 0) this.product = add;
		else this.product[this.property] = add;
	}

	/**
	 * Assigns another factory instance to this factory as a 
	 * {@link NSFactory#subFactory subFactory}.
	 * @arg {NSFactory} subFactory Sub-factory to assign
	 * @returns {this} The factory, for chaining
	 * @throws {TypeError} `subFactory` must be an instance of an `NSFactory`.
	 * @public
	 */
	assignSubFactory(subFactory) {
		if(!(subFactory instanceof NSFactory))
			throw new TypeError('Invalid SubFactory assignment: ' + subFactory);
		this.subFactory = subFactory;
		return this;
	}

	/**
	 * Calls the {@link NSFactory#addToProduct} function, passing the
	 * {@link NSFactory#product product} of the currently assigned
	 * {@link NSFactory#subFactory subFactory} as value; then removes that
	 * sub-factory assignment.
	 * @returns {void}
	 * @protected
	 */
	emptySubFactory() {
		if(!(this.subFactory instanceof NSFactory)) return;

		this.addToProduct(this.subFactory.deliver());
		this.subFactory = null;
	}

	/**
	 * Creates a new entry in this factory's {@link NSFactory#cases cases} for
	 * the given tag name.
	 * @arg {string} name Name of the XML tag to assign the handler to
	 * @arg {TagHandler} handler Function to invoke for handling the tag
	 * @returns {this} The factory, for chaining multiple cases
	 * @public
	 */
	onCase(name, handler) {
		if(typeof name !== 'string')
			throw new TypeError('Invalid case:' + name);
		if(typeof handler !== 'function')
			throw new TypeError('Invalid converter function: ' + handler);

		if(this.cases[name] === undefined) this.cases[name] = [];
		this.cases[name].push(handler);
		return this;
	}

	/**
	 * Called when a new tag gets opened in the source XML. Searches the
	 * registered {@link NSFactory#cases cases} for a matching tag name,
	 * invoking the associated {@link TagHandler}s and assigning a new
	 * {@link NSFactory#subFactory subFactory} for receiving the node content,
	 * if not done by one of the registered handlers. If the `cases` don't
	 * cover the tag, {@link NSFactory#ignore ignore} mode is activated.
	 * @arg {string} name Name of the tag in the source XML
	 * @arg {Attributes} attrs Key-value map of present attributes
	 * @returns {boolean} `true` if handled, otherwise `false`
	 * @package
	 */
	handleOpen(name, attrs) {
		if(this.finalised) throw new FactoryFinalisedError();
		if(typeof name !== 'string') return false;
		if(this.subFactory) return this.subFactory.handleOpen(name, attrs);

		// If the currently ignored tag has not yet been closed, stay passive
		if(this.ignore.length > 0) return false;

		// If there is a registered case for the tag, call associated handlers
		if(name in this.cases) {
			this.ignore = '';
			for(let handler of this.cases[name]) handler(this, attrs);

			// All opened tags MUST be handled by a sub-factory!
			if(!this.subFactory) this.assignSubFactory(new NSFactory());
			return true;
		}

		// Lastly, should the tag not meet any criteria, ignore it
		this.ignore = name;
		return false;
	}

	/**
	 * Called when a tag gets closed in the source XML. If that tag is the one
	 * that triggered {@link NSFactory#ignore ignore} mode, that gets ended.
	 * Otherwise, any collected text {@link NSFactory#data data} is added to
	 * the {@link NSFactory#product product}, and the factory declares itself
	 * {@link NSFactory#finalised finalised}.
	 * @arg {string} name Name of the source XML tag that is being closed
	 * @returns {boolean} `true` if handled, otherwise `false`
	 * @package
	 */
	handleClose(name) {
		if(this.finalised) throw new FactoryFinalisedError();
		if(typeof name !== 'string') return false;
		if(this.subFactory) {	// Receive final products of sub-factories
			let ret = this.subFactory.handleClose(name);
			if(this.subFactory.finalised) this.emptySubFactory();
			return ret;
		}

		// If this tag is that whose contents are being ignored, stop with that
		if(this.ignore === name) {
			this.ignore = '';
			return true;
		} else if(this.ignore.length > 0) return false;

		/**
		 * At this point, the closing tag must be the root tag, since all tags
		 * that are handled receive a sub-factory assignment, and all that are
		 * not are ignored.
		 */

		// Append any received text to this factory's product, then finalise it
		if(this.data !== null) this.addToProduct(this.data);
		return this.finalised = true;
	}

	/**
	 * Called when a text node is read in the source XML. This appends its text
	 * content to the received text {@link NSFactory#data data}.
	 * @arg {string} text Text data received
	 * @returns {boolean} `true` if handled, otherwise `false`
	 * @package
	 */
	handleText(text) {
		if(this.finalised) throw new FactoryFinalisedError();
		if(typeof text !== 'string') return false;
		if(this.subFactory) return this.subFactory.handleText(text);

		if(this.ignore.length > 0) return false;

		if(this.data === null) this.data = text;
		else this.data += text;
		return true;
	}

	/**
	 * Called when a `CDATA` node is read in the source XML. This simply passes
	 * the received data to the {@link NSFactory#handleText} function.
	 * @arg {string} cdata Text data received
	 * @returns {boolean} `true` if handled, otherwise `false`
	 * @package
	 */
	handleCData(cdata) {
		if(this.subFactory) return this.subFactory.handleCData(cdata);

		return this.handleText(cdata);
	}

	/**
	 * Called when the XML parser encounters an error. This simply throws a new
	 * `NSError`.
	 * @arg {Error} err 
	 * @throws {NSError} A new `NSError`, referring back to the passed one
	 * @package
	 */
	handleError(err) {
		throw new NSError('XML parser encountered error:  ' + err.message);
	}
}

/**
 * A special factory that is not {@link NSFactory#finalised finalised} after
 * producing only a single {@link NSFactory#product product}, instead producing
 * multiple instances for a {@link ArrayFactory#collection collection} of
 * `product`s.
 * @template ProductType
 */
class ArrayFactory extends NSFactory {

	/**
	 * List of {@link NSFactory#product}s produced by this factory.
	 * @type {ProductType[]}
	 * @private
	 */
	collection = [];

	/**
	 * Finally, the `product` gets pushed to this factory's
	 * {@link ArrayFactory#collection collection}.
	 * @inheritdoc
	 */
	addToProduct(val) {
		super.addToProduct(val);
		this.collection.push(this.product);
	}

	/**
	 * Requests delivery of the {@link ArrayFactory#collection collection} of
	 * this factory. If it isn't {@link NSFactory#finalised finalised} yet, the
	 * factory will withhold the `collection`.
	 * @returns {ProductType[]} The `collection`.
	 * @throws {ProductWithheldError} The `collection` must be `finalised`!
	 */
	deliver() {
		if(!this.finalised) throw new ProductWithheldError();
		return this.collection;
	}
}

/**
 * A standard {@link DataConverter} function that examines the supplied value
 * and attempts to convert it to the `number` it is equivalent to.
 * @arg {string} val Text value to convert
 * @returns {number} The equivalent number value; `NaN` if none exists
 */
function convertNumber(val) {
	if(/^\d+\.\d+$/.test(val)) return parseFloat(val);
	else return parseInt(val);
}

/**
 * A standard {@link DataConverter} function that returns `true` if the
 * supplied value is `'1'`, and `false` otherwise.
 * @arg {string} val Text value to check
 * @returns {boolean} `true` if `val==='1'`, otherwise `false`
 */
function convertBoolean(val) {
	return val === '1';
}

exports.NSFactory = NSFactory;
exports.ArrayFactory = ArrayFactory;
exports.convertNumber = convertNumber;
exports.convertBoolean = convertBoolean;
