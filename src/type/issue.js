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

const IssueOption = require('./issue-option');
const IssueOptionWarning = require('./issue-option-warning');

/**
 * @type {import('../factory').FactoryConstructor<types.Issue>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.set('id', root['id'], convertNumber)
	.set('warnings', [])	// In most cases, there are no warnings

	.onTag('TITLE', (me) => me
		.build('title'))
	.onTag('TEXT', (me) => me
		.build('description'))
	.onTag('OPTION', (me, attrs) => me
		.build('options', val => {
			let alreadyThere = me.get('options');
			if(Array.isArray(alreadyThere)) return [...alreadyThere, val];
			return [val];
		})
		.assignSubFactory(IssueOption.create(attrs)))
	.onTag('WARNING', (me, attrs) => me
		.build('warnings', val => {
			let alreadyThere = me.get('warnings');
			if(Array.isArray(alreadyThere)) return [...alreadyThere, val];
			return [val];
		})
		.assignSubFactory(IssueOptionWarning.create(attrs)))
	.onTag('AUTHOR', (me) => me
		.build('author', val => val.split(', ')))
	.onTag('EDITOR', (me) => me
		.build('editor', val => val.split(', ')))
	.onTag('PIC1', (me) => me
		.build('imageLarge'))
	.onTag('PIC2', (me) => me
		.build('imageSmall'));
