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
 * @type {import('../factory').FactoryConstructor<types.RMBPost>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.set('id', root['id'], convertNumber)
	.onTag('NATION', (me) => me
		.build('nation'))
	.onTag('MESSAGE', (me) => me
		.build('text'))
	.onTag('LIKES', (me) => me
		.build('likes', convertNumber))
	.onTag('LIKERS', (me) => me
		.build('likers', convertArray(':')))
	.onTag('TIMESTAMP', (me) => me
		.build('timestamp', convertNumber))
	.onTag('STATUS', (me) => me
		.build('status', convertNumber))
	.onTag('SUPPRESSOR', (me) => me
		.build('suppressor'))

	// <LIKERS> is not returned by the API if the post has no likes
	.set('likers', []);
