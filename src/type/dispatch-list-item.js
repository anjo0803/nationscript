/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	convertNumber
} = require('../factory');
const types = require('../types');

/**
 * @type {import('../factory').FactoryConstructor<types.ListDispatch>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.set('id', root['id'], convertNumber)
	.onTag('TITLE', (me) => me
		.build('title'))
	.onTag('AUTHOR', (me) => me
		.build('author'))
	.onTag('CATEGORY', (me) => me
		.build('categoryTop'))
	.onTag('SUBCATEGORY', (me) => me
		.build('categorySub'))
	.onTag('CREATED', (me) => me
		.build('posted', convertNumber))
	.onTag('EDITED', (me) => me
		.build('edited', convertNumber))
	.onTag('VIEWS', (me) => me
		.build('views', convertNumber))
	.onTag('SCORE', (me) => me
		.build('score', convertNumber));
