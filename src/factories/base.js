/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSError,
	VirtualError,
	ProductWithheldError
} = require('../errors');

/**
 * @callback DataConverter
 * Contains an operation to be performed on the passed string. This might be a
 * conversion to a number value or a translation into a boolean, for example.
 * @arg {string} val Text value to operate on
 * @return {boolean|string|number} The result of the conversion
 */

/**
 * @callback TagHandler
 * 
 * @arg {Object.<string, string>} attrs Key-value map of the tag's attributes
 * @return {void}
 * @todo
 */

/**
 * The basic factory class, containing functions for the handling of events
 * emitted by the XML parser on the responses from the NationStates API.
 * 
 * Each factory builds a configured {@link NSFactory#product product}. One at a
 * time, the factory targets a specific {@link NSFactory#property property} of
 * its `product`, using any data received from the XML parser to either
 * {@link NSFactory#data build primitive} values for its `product` itself, or
 * passing the data to an assigned {@link NSFactory#subFactory sub-factory},
 * which can use them to build its own `product`, later to be then added to the
 * parent factory's `product` as a property.
 * 
 * Such data is received from the parser over the following events:
 * - {@link NSFactory#onOpen}
 * - {@link NSFactory#onClose}
 * - {@link NSFactory#onText}
 * - {@link NSFactory#onCData}
 * 
 * Upon receiving an `onOpen()` call, the factory checks whether its registered
 * {@link NSFactory#cases cases} cover the associated XML node's name. If so,
 * the associated handler function from the `cases` is called, passing the
 * received attributes as argument. Otherwise, the factory will
 * {@link NSFactory#ignore ignore} that XML node, meaning that no more events
 * will be processed until an `onClose()` call is received for that node.
 * 
 * A factory develops its `product` until an `onClose()` event is received for
 * its {@link NSFactory#root root} node, officially making the `product`
 * {@link NSFactory#finalised finalised}. From that point on, the factory can
 * {@link NSFactory#deliver} the `product`.
 * 
 * By itself, a factory only handle text nodes of source XML (plus attributes),
 * collecting the text data and assigning it to the targeted `property` upon
 * receiving an `onClose()` call. To parse other types of nodes, a `subFactory`
 * must be assigned on the `onOpen()` call for that node.
 * @summary Class for handling data from events emitted during XML parsing.
 * @template ProductType Type of this factory's `product`
 */
class NSFactory {

	/**
	 * What this factory is producing. Properties are gradually built up from
	 * data contained in events passed to this factory by the XML parser.
	 * @type {ProductType}
	 * @protected
	 */
	product = {};

	/**
	 * Name of the {@link NSFactory#product product}'s property that is
	 * currently being worked on. If it is empty, the whole `product` itself
	 * will be set to calculated property values.
	 * @type {string}
	 * @protected
	 * @default
	 */
	property = '';

	/**
	 * Container for the primitive data collected for a direct assignment to
	 * the {@link NSFactory#property property}.
	 * @protected
	 */
	data = {
		/**
		 * The text value currently collected.
		 * @type {string}
		 */
		value: '',
		/**
		 * A converter function to be called on the `value` before assigning it
		 * to the target {@link NSFactory#property property}.
		 * @type {DataConverter}
		 */
		convert: (val) => val
	}

	/**
	 * The sub-factory currently assigned to handle events passed to this
	 * {@link NSFactory}. If none is assigned, `null`.
	 * @type {NSFactory|null}
	 * @see {@link NSFactory#assignSubFactory}
	 * @see {@link NSFactory#emptySubFactory}
	 * @protected
	 * @default
	 */
	subFactory = null;

	/**
	 * Name of the source XML tag whose contents this {@link NSFactory} is
	 * designated to handle. If it is empty, the factory will automatically
	 * assign the first tag it receives an `onOpen()` call for as its root.
	 * @type {string}
	 * @protected
	 */
	root;

	/**
	 * `true` if the {@link NSFactory#root root} of this {@linkcode NSFactory}
	 * has been closed and the {@link NSFactory#product product} should thus be
	 * considered final, otherwise `false`.
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
	 * @protected
	 */
	cases = {};

	/**
	 * Name of the current un-handled node in the source XML. If no node is
	 * currently being ignored, this is an empty `string`.
	 * @type {string}
	 * @protected
	 */
	ignore = '';

	/**
	 * Instantiates a new `NSFactory` to handle emitted XML parsing events from
	 * within the given `root` node.
	 * @arg {string} root Name of the root tag; empty to choose automatically
	 */
	constructor(root = '') {
		if(typeof root === 'string') this.root = root;
		else throw new TypeError('Invalid factory root tag:' + root);
	}

	/**
	 * Requests this factory to deliver its {@link NSFactory#product product}.
	 * factory. Should it not be {@link NSFactory#finalised finalised} yet, the
	 * factory will withhold the `product`; If it is, the `product` is returned
	 * and reset for producing a new instance.
	 * @returns {ProductType} The `product`.
	 * @throws {ProductWithheldError} The `product` must be `finalised`!
	 * @public
	 */
	deliver() {
		if(!this.finalised)
			throw new ProductWithheldError(this.constructor.name);

		let ret = this.product;
		this.product = {};
		return ret;
	}

	/**
	 * Configures this factory to build the property of the given `name` on its
	 * {@link NSFactory#product product} next. This also resets the stored
	 * primitive {@link NSFactory#data data}, including the converter function.
	 * @arg {string} name New target {@link NSFactory#property property}
	 * @arg {DataConverter} convert New converter function for primitive data
	 * @returns {this} The factory, for chaining
	 * @public
	 */
	build(name, convert = (val) => val) {
		if(typeof name !== 'string')
			throw new TypeError('Invalid target product property:' + name);
		if(typeof convert !== 'function')
			throw new TypeError('Invalid property converter: ' + convert);

		this.property = name;
		this.data.value = '';
		this.data.convert = convert;
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
		if(this.property.length === 0) this.product = val;
		else this.product[this.property] = val;
	}

	/**
	 * Assigns another factory instance to this factory as a 
	 * {@link NSFactory#subFactory sub-factory}.
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
	 * {@link NSFactory#subFactory sub-factory} as value; then removes that
	 * sub-factory assignment. This should only be done if the sub-factory has
	 * declared its `product` to be {@link NSFactory#finalised finalised}.
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
	 * @param {string} name Name of the XML tag to assign the handler to
	 * @param {TagHandler} handler Function to invoke for handling the tag
	 * @returns {this} The factory, for chaining multiple cases
	 * @public
	 */
	onCase(name, handler) {
		if(typeof name !== 'string')
			throw new TypeError('Invalid case:' + name);
		if(typeof handler !== 'function')
			throw new TypeError('Invalid converter function: ' + convert);

		if(this.cases[name] === undefined) this.cases[name] = [];
		this.cases[name].push(handler);
		return this;
	}

	/**
	 * Called when a new tag gets opened in the source XML. This invokes the
	 * separate - abstract - {@link NSFactory#decide} function with the same
	 * parameters, and its return value is returned by this function as well.
	 * @arg {string} name Name of the tag in the source XML
	 * @arg {Object.<string, string>} attrs Key-value map of present attributes
	 * @returns {boolean} `true` if handled, otherwise `false`
	 * @package
	 */
	handleOpen(name, attrs) {
		if(typeof name !== 'string') return false;
		if(this.subFactory) return this.subFactory.handleOpen(name, attrs);

		// If the currently ignored tag has not yet been closed, stay passive
		if(this.ignore.length > 0) return false;

		// If there is a registered case for the tag, call associated handlers
		if(name in this.cases) {
			this.ignore = false;
			for(let handler of this.cases[name]) handler(attrs);
			return true;
		}

		// If the root is to be set automatically, take the first tag received
		if(this.root === '') {
			this.root = name;
			return true;
		}

		// Lastly, should the tag not meet any criteria, ignore it
		this.ignore = name;
		return false;
	}

	/**
	 * Called when a tag gets closed in the source XML. If that tag is the
	 * {@link NSFactory#root root} of this factory, the factory declares its
	 * {@link NSFactory#product product} {@link NSFactory#finalised finalised}.
	 * Otherwise, any collected primitive {@link NSFactory#data data} is added
	 * to the `product` via {@link NSFactory#addToProduct}.
	 * @arg {string} name Name of the source XML tag that is being closed
	 * @returns {boolean} `true` if handled, otherwise `false`
	 * @package
	 */
	handleClose(name) {
		if(typeof name !== 'string') return false;
		if(this.subFactory) {
			let ret = this.subFactory.handleClose(name);

			// Receive final products of sub-factories
			if(this.subFactory.finalised) this.emptySubFactory();
			return ret;
		}

		// If this tag is that whose contents are being ignored, stop with that
		if(this.ignore === name) {
			this.ignore = '';
			return true;
		} else if(this.ignore.length > 0) return false;

		// If this tag finalises this factory's product, declare it so
		if(this.root === name) return this.finalised = true;

		// Otherwise, append any received text to this factory's product
		this.addToProduct(this.data.convert(this.data.value));

		return true;
	}

	/**
	 * Called when a text node is read in the source XML. This appends the
	 * received text to the primitive {@link NSFactory#data data} `value`.
	 * @arg {string} text Text data received
	 * @returns {boolean} `true` if handled, otherwise `false`
	 * @package
	 */
	handleText(text) {
		if(typeof text !== 'string') return false;
		if(this.subFactory) return this.subFactory.handleText(text);

		if(this.ignore.length > 0) return false;

		this.data.value += text;
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
 * multiple instances of it from the 
 *  {@link ArrayFactory#collection collection}
 * until it itself is
 * {@link NSFactory#finalised finalised}. 
 * @template ProductType
 */
class ArrayFactory extends NSFactory {

	/**
	 * List of {@link NSFactory#product}s produced by this factory.
	 * @type {ProductType[]}
	 * @protected
	 */
	collection = [];

	/**
	 * Pushes the assigned {@link NSFactory#subFactory sub-factory}'s current
	 * {@link NSFactory#product product} to this factory's
	 * {@link ArrayFactory#collection collection}; then replaces the old
	 * sub-factory with a new one. This should only be done if the sub-factory
	 * has declared its `product` to be {@link NSFactory#finalised finalised}.
	 * @returns {void}
	 * @package
	 */
	emptySubFactory() {
		if(!(this.subFactory instanceof NSFactory)) return;
		this.addToProduct(this.subFactory.deliver());
	}

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
		if(!this.finalised)
			throw new ProductWithheldError(this.constructor.name);
		let ret = this.collection;
		this.collection = [];
		return ret;
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
