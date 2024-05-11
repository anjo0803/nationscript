/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * NationScript-specific errors.
 * @module nationscript/errors
 */

/**
 * A generic NationScript-related `Error`.
 */
class NSError extends Error {
	/**
	 * Instantiates a new {@linkcode NSError}.
	 * @arg {string} message Error message to display
	 */
	constructor(message = 'Internal error') {
		super(message);
		this.name = this.constructor.name;
	}
}

/**
 * An {@link NSError} related to a failure in communications with the
 * NationStates API.
 */
class APIError extends NSError {
	/**
	 * Instantiates a new {@linkcode APIError}.
	 * @arg {string} message Error message to display.
	 */
	constructor(message) {
		super('API error: ' + message);
	}
}

/**
 * An {@link APIError} indicating that a queried entity, e.g. a nation or
 * region, has not been found by the NationStates API.
 */
class EntityNotFoundError extends APIError {
	constructor() {
		super('Requested entity not found');
	}
}

/**
 * An {@link APIError} indicating that an attempted nation login failed.
 */
class RecentLoginError extends APIError {
	constructor() {
		super('Last non-PIN login too recent');
	}
}

/**
 * An {@link APIError} indicating that the legal rate limit was exceeded.
 */
class RatelimitError extends APIError {
	/**
	 * Number of seconds the API has stated to wait before resuming requests.
	 * @type {number}
	 */
	retry;
	/**
	 * @arg {string|number} retry Number of seconds to wait
	 */
	constructor(retry = '30') {
		super(`Ratelimit exceeded; retry in ${retry}s`);
		this.retry = typeof retry === 'number' ? retry : parseInt(retry);
	}
}

/**
 * An {@link APIError} indicating a Daily Data Dump requested on condition of
 * modification after a given date has not been modified after that date.
 */
class DumpNotModifiedError extends APIError {
	constructor() {
		super('Dump not modified');
	}
}

/**
 * An {@link NSError} indicating a virtual function has not been implemented in
 * a subclass.
 */
class VirtualError extends NSError {
	/**
	 * @arg {Function} func Function that needed to be implemented
	 * @arg {?Function} parent Constructor of the inheriting class
	 */
	constructor(func, parent = null) {
		super('Virtual function not implemented: '
			+ (parent !== null ? parent.name + '.' : '')
			+ func.name);
	}
}

/**
 * An {@link NSError} thrown when a factory which has not yet finalised its
 * `product` was asked to deliver its `product`.
 */
class ProductWithheldError extends NSError {
	constructor() {
		super('Factory withheld still-work-in-progress product');
	}
}

/**
 * An {@link NSError} thrown when a factory which has already finalised its
 * `product` was asked to handle further emitted XML parsing events.
 */
class FactoryFinalisedError extends NSError {
	constructor() {
		super('Finalised factory refused to process data');
	}
}

exports.NSError = NSError;
exports.APIError = APIError;
exports.EntityNotFoundError = EntityNotFoundError;
exports.RecentLoginError = RecentLoginError;
exports.RatelimitError = RatelimitError;
exports.DumpNotModifiedError = DumpNotModifiedError;
exports.VirtualError = VirtualError;
exports.ProductWithheldError = ProductWithheldError;
exports.FactoryFinalisedError = FactoryFinalisedError;
