/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Extracts the textual value at the described position within the parsed XML, if one exists.
 * @param {object} obj The object returned by the XML parser from which to read an attribute.
 * @param {string} property Name of the desired attribute of `obj`.
 * @returns {string} The string value of the named attribute, or `undefined` if not found.
 * @ignore
 */
exports.attr = function(obj, name) {
	return obj?.['$attrs']?.[name];
}

/**
 * Extracts the textual value at the described position within the parsed XML, if one exists.
 * @param {object} obj The object returned by the XML parser which to use as the base.
 * @param {string} property Name of the property of `obj` that should be used.
 * @param {number} index Index of the desired value within the property. The default is `0`.
 * @returns {string} The string value at the given position, or `null` if not found.
 * @ignore
 */
exports.txt = function(obj, property, index = 0) {
	let x = obj?.[property];
	if(Array.isArray(x)) return x[index]?.toString().trim();
	else if(x) return x.toString().trim();
	else return null;
}

/**
 * Extracts the numerical value at the described position within the parsed XML, if one exists.
 * @param {object} obj The object returned by the XML parser which to use as the base.
 * @param {string} property Name of the property of `obj` that should be used.
 * @param {number} index Index of the desired value within the property. The default is `0`.
 * @returns {number} The numerical value at the given position, or `NaN` if not found.
 * @ignore
 */
exports.num = function(obj, property, index = 0) {
	let val = exports.txt(obj, property, index);
	if(/^\d+\.\d+$/.test(val)) return parseFloat(val);
	else if(/^\d+$/.test(val)) return parseInt(val);
	else return NaN;
}

/**
 * Extracts the array value at the described position within the parsed XML, if one exists.
 * @param {object} obj The object returned by the XML parser which to use as the base.
 * @param {string} property Name of the property of `obj` that should be used.
 * @param {number} index Index of the desired array within the property. The default is `0`.
 * @returns {any[]} The array of values at the given position, or `null` if not found.
 * @ignore
 */
exports.arr = function(obj, property, index = 0) {
	let ret = obj?.[property];
	if(ret === undefined) return null;

	if(ret[index] === undefined) return [];
	else if(Array.isArray(ret[index])) return ret[index];
	else if(!Array.isArray(ret)) return [ret];
	else return ret;
}

/**
 * Checks whether the given value can be iterated over e.g. via `for`.
 * @param {any} obj Value to check.
 * @returns {boolean} `true` if iterable, `false` if not.
 * @ignore
 */
exports.iterable = function(obj) {
	if(obj == null) return false;
	return typeof obj[Symbol.iterator] === 'function';
}

/**
 * Confirms that the given root exists and executes the handler function on it.
 * @param {object} root Part of the object returned by the XML parser to use as root element.
 * @param {function} handler Handler function to use on the root.
 * @returns The return value of the handler function.
 * @ignore
 */
exports.handle = function(root, handler) {
	if(root === undefined || typeof handler !== 'function') return undefined;
	else return handler(root);
}

/**
 * Confirms that the given root exists and executes the handler function on it.
 * @param {any[]} root Array property of the object returned by the XML parser to use as root.
 * @param {function} handler Handler function to use on the elements of the root.
 * @returns A list with the results from the handler function for each element of the root.
 * @ignore
 */
exports.handleList = function(root, handler) {
	if(root === undefined || typeof handler !== 'function') return [];
	let ret = [];
	let iterate = exports.secureArray(root);
	if(exports.iterable(iterate)) for(let obj of iterate) ret.push(handler(obj));
	return ret;
}

/**
 * Wraps the given value into a single-element array, if it isn't already an array.
 * @param {*} arr Value to confirm as array.
 * @returns {any[]} The value, if it's an array, otherwise a single-element array with the value.
 * @ignore
 */
exports.secureArray = function(arr) {
	if(!Array.isArray(arr)) arr = [arr];
	return arr;
}
