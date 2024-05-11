/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	convertNumber,
	convertArray
} = require('../factory');
const types = require('../types');

/**
 * @type {import('../factory').FactoryConstructor<types.PollOption>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.set('id', root['id'], convertNumber)
	.onTag('OPTIONTEXT', (me) => me
		.build('text'))
	.onTag('VOTES', (me) => me
		.build('votes', convertNumber))
	.onTag('VOTERS', (me) => me
		.build('voters', convertArray(':')));
