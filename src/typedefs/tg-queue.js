/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { num } = require('../requests/converter');

/**
 * Container object specifying the total number of telegrams that are currently awaiting delivery,
 * sorted by the type of queue each.
 * @typedef {object} TGQueue
 * @prop {number} manual Total number of manually-sent telegrams awaiting delivery.
 * @prop {number} mass Total number of mass telegrams awaiting delivery.
 * @prop {number} api Total number of telegrams sent via the API awaiting delivery.
 */
/**
 * Builds a queue object from the provided parsed response XML.
 * @param {object} queue The root object - the `<TGQUEUE>` tag in the parsed XML object.
 * @returns {TGQueue} The built queue object.
 * @ignore
 */
exports.parseTGQueue = (queue) => {
	return {
		manual:	num(queue, 'MANUAL'),
		mass:	num(queue, 'MASS'),
		api:	num(queue, 'API')
	};
}
