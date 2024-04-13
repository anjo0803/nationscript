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
 * Superclass for all factory classes, containing functions for the handling of
 * events emitted by the XML parser on the responses from the NationStates API.
 * 
 * Each factory builds exactly one instance of its configured
 * {@link NSFactory#product product}. One at a time, the factory targets a
 * specific {@link NSFactory#property property} of its `product`, using the
 * received data to either {@link NSFactory#data itself build primitives} for
 * assignment or to have more complex properties be themselves built by a
 * {@link NSFactory#subFactory sub-factory}.
 * 
 * Data is received from the parser over the following events:
 * - {@link NSFactory#onOpen}
 * - {@link NSFactory#onClose}
 * - {@link NSFactory#onText}
 * - {@link NSFactory#onCData}
 * 
 * These functions *should not be overridden* - or at least called from within
 * an overriding function - since they contain some important logic for the
 * smooth operation of factory chains. The central function to override in
 * specialised factories instead is {@link NSFactory#decide}.
 * 
 * By itself, a factory only handle XML nodes containing text data (plus their
 * attributes) - that is, all nodes that are *direct* children of the factory's
 * {@link NSFactory#root root} node and that do not themselves have non-text
 * node children. To handle other types of nodes, a sub-factory must be
 * assigned when that tag is opened.
 * 
 * A factory remains in operation until it receives an `onClose()` event for
 * its `root` node. Once this happens, it will set its
 * {@link NSFactory#finalised finalised} property to `true`, so that a possible
 * parent factory can proceed to extract the sub-factory's final `product` and
 * add it to its own `product`.
 * @template ProductType Type of this factory's `product`
 * @summary Basic class for handling events emitted during XML parsing.
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
	 * designated to handle.
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
	 * Instantiate a new `NSFactory` instance to handle emitted XML parsing
	 * events on direct children of the given `root` node.
	 * @arg {string} root Name of the XML root tag to handle
	 */
	constructor(root) {
		if(typeof root === 'string') this.root = root;
		else throw new TypeError('Invalid factory root tag:' + root);
	}

	/**
	 * Requests delivery of the {@link NSFactory#product product} of this
	 * factory. If it isn't {@link NSFactory#finalised finalised} yet, the
	 * factory will withhold the `product`.
	 * @returns {ProductType} The `product`.
	 * @throws {ProductWithheldError} The `product` must be `finalised`!
	 */
	deliver() {
		if(this.finalised) return this.product;
		else throw new ProductWithheldError(this.constructor.name);
	}

	/**
	 * Configures this factory to target the property of the given `name` on
	 * its {@link NSFactory#product product} next. This also resets the stored
	 * primitive {@link NSFactory#data data}, including the converter function.
	 * @arg {string} name New target {@link NSFactory#property property}
	 * @arg {DataConverter} convert New converter function for primitive data
	 * @returns {void}
	 * @package
	 */
	setTarget(name, convert = (val) => val) {
		if(typeof name !== 'string')
			throw new TypeError('Invalid target product property:' + name);
		if(typeof convert !== 'function')
			throw new TypeError('Invalid property converter: ' + convert);

		this.property = name;
		this.data.value = '';
		this.data.convert = convert;
	}

	/**
	 * Assigns the given value to the {@link NSFactory#property property} that
	 * is currently being targeted on the {@link NSFactory#product product}. If
	 * an empty name is targeted, the `product` as a whole is set to `val`.
	 * @arg {any} val Value to assign
	 * @returns {void}
	 * @package
	 */
	addToProduct(val) {
		if(this.property.length === 0) this.product = val;
		else this.product[this.property] = val;
	}

	/**
	 * Assigns another factory instance to this factory as a 
	 * {@link NSFactory#subFactory sub-factory}. This should either be done
	 * upon initialisation, or during an {@link NSFactory#onOpen} event.
	 * @arg {NSFactory} subFactory Sub-factory to assign
	 * @returns {void}
	 * @throws {TypeError} `subFactory` must be an instance of an `NSFactory`.
	 * @package
	 */
	assignSubFactory(subFactory) {
		if(!(subFactory instanceof NSFactory))
			throw new TypeError('Invalid SubFactory assignment: ' + subFactory);
		this.subFactory = subFactory;
	}

	/**
	 * Calls the {@link NSFactory#addToProduct} function, passing the
	 * {@link NSFactory#product product} of the currently assigned
	 * {@link NSFactory#subFactory sub-factory} as value; then removes that
	 * sub-factory assignment. This should only be done if the sub-factory has
	 * declared its `product` to be {@link NSFactory#finalised finalised}.
	 * @returns {void}
	 * @package
	 */
	emptySubFactory() {
		if(!(this.subFactory instanceof NSFactory)) return;

		this.addToProduct(this.subFactory.deliver());
		this.subFactory = null;
	}

	/**
	 * Decides the course of action on a newly-opened tag in the XML source.
	 * @arg {string} name Name of the new tag
	 * @arg {Object.<string, string>} attrs Key-value map of present attributes
	 * @returns {boolean} `true` if a decision was reached, otherwise `false`.
	 * @throws {VirtualError} Must be overridden in inheritor classes!
	 * @virtual
	 * @package
	 */
	decide(name, attrs) {
		throw new VirtualError(this.decide.name, this.constructor.name);
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

		return this.decide(name, attrs);
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
 * An `ArrayFactory` is a special factory that is able to produce multiple
 * instances of its designated {@link NSFactory#product product}, storing them
 * all in its {@link ArrayFactory#collection collection} until it itself is
 * {@link NSFactory#finalised finalised}. At that point, the `collection` is
 * moved to be the `product`.
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
	 * Decides the course of action on a newly-opened tag in the XML source.
	 * The basic ArrayFactory ignores all arguments, effectively making its
	 * {@link NSFactory#product product} either a primitive value, or whatever
	 * an assigned {@link NSFactory#subFactory sub-factory} produces.
	 * @arg {string} name Name of the new tag
	 * @arg {Object.<string, string>} attrs Key-value map of present attributes
	 * @returns {boolean} `true` if a decision was reached, otherwise `false`.
	 * @override
	 * @package
	 */
	decide(name, attrs) {
		this.setTarget('');
		return true;
	}

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
		this.collection.push(this.subFactory.deliver());

		/* 
		 * By definition, the ArrayFactory produces at least, not exactly, one
		 * product instance. Thus, whenever a sub-factory has finished its
		 * production, a new sub-factory instance gets readied in advance.
		 */
		this.subFactory = this.subFactory.constructor(this.subFactory.root);
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
		if(this.finalised) return this.collection;
		else throw new ProductWithheldError(this.constructor.name);
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

exports.NSFactory = NSFactory;
exports.ArrayFactory = ArrayFactory;
exports.convertNumber = convertNumber;
