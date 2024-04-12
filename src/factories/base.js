/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSError,
	PropertyInvalidError,
	VirtualError
} = require('../errors');

class NSFactory {

	/**
	 * What this {@linkcode NSFactory} is producing. Over the course of XML
	 * parsing, the contents of the parsed XML tags get added to it, until the
	 * {@linkcode NSFactory#root} this factory is serving gets closed, causing
	 * this factory to declare itself {@linkcode NSFactory#finalised}.
	 * @protected
	 */
	product = null;

	/**
	 * The sub-factory currently assigned to handle events passed to this
	 * {@linkcode NSFactory}. If none is assigned, `null`.
	 * 
	 * Using the {@linkcode NSFactory#assignSubFactory()} function, a new
	 * sub-factory may be assigned to handle the contents which will be
	 * encountered within a newly opened XML tag.
	 * 
	 * While an assigned sub-factory isn't {@linkcode NSFactory#finalised}, a
	 * parent factory will pass all events it receives down to its sub-factory.
	 * Once it is finalised, the {@linkcode NSFactory#product} produced by it
	 * is retrieved by the parent factory, which will proceed with it according
	 * to its {@linkcode NSFactory#emptySubFactory()} function.
	 * @type {NSFactory|null}
	 * @summary Sub-factory assigned to handle events for this factory.
	 * @protected
	 */
	subFactory = null;

	/**
	 * Name of the source XML tag whose contents this {@linkcode NSFactory}
	 * is designated to handle. Once the {@linkcode NSFactory#handleClose()}
	 * event is received for this tag name, this factory instance becomes
	 * {@linkcode NSFactory#finalised} and its {@linkcode NSFactory#product}
	 * will be left for processing by a parent factory.
	 * @type {string|null}
	 * @protected
	 */
	root = null;

	/**
	 * `true` if the {@linkcode NSFactory#root} of this {@linkcode NSFactory}
	 * has been closed and the {@linkcode NSFactory#product} should thus be
	 * considered final, otherwise `false`.
	 * @type {boolean}
	 * @protected
	 */
	finalised = false;

	/**
	 * 
	 * @param {string} root Name of the XML root tag to handle
	 */
	constructor(root) {
		if(typeof root === 'string') this.root = root;
		else throw new TypeError('Invalid factory root tag:' + root);
	}

	/**
	 * Assigns another factory instance as a {@linkcode NSFactory#subFactory}
	 * for this {@linkcode NSFactory}.
	 * @param {NSFactory} subFactory Sub-factory to assign
	 */
	assignSubFactory(subFactory) {
		if(!(subFactory instanceof NSFactory))
			throw new TypeError('Invalid SubFactory assignment: ' + subFactory);
		this.subFactory = subFactory;
	}

	/**
	 * @virtual
	 */
	handleOpen(name, attrs) {
		if(this.subFactory) return this.subFactory.handleOpen(name, attrs);

		throw new VirtualError(this.handleOpen.name, this.constructor.name);
	}

	handleClose(name) {
		if(typeof name !== 'string') return false;

		if(this.subFactory) {
			let ret = this.subFactory.handleClose(name);
			if(this.subFactory.finalised) this.emptySubFactory();
			return ret;
		}

		if(this.root === name) return this.finalised = true;
	}

	/**
	 * @virtual
	 */
	emptySubFactory() {
		throw new VirtualError(this.emptySubFactory.name,
			this.constructor.name);
	}

}

class ObjectFactory extends NSFactory {
	/**
	 * @type {object}
	 * @inheritdoc
	 */
	product = {};

	/**
	 * Name of the property that is currently being created on the
	 * {@linkcode NSFactory#product} of this {@linkcode ObjectFactory}.
	 * @type {string}
	 * @protected
	 */
	property = '';

	/**
	 * 
	 * @returns {void}
	 * @override
	 */
	emptySubFactory() {
		if(!(this.subFactory instanceof NSFactory)) return;
		if(this.property?.length > 0)
			this.product[this.property] = this.subFactory.product;
		else throw new PropertyInvalidError('property', this.property,
				this.constructor.name);
		this.subFactory = null;
	}
}

class ArrayFactory extends NSFactory {
	/**
	 * @type {any[]}
	 * @inheritdoc
	 */
	product = [];

	/**
	 * 
	 * @returns {void}
	 * @override
	 */
	emptySubFactory() {
		if(!(this.subFactory instanceof NSFactory)) return;
		this.products.push(this.subFactory.construct);
		this.subFactory = null;
	}
}
