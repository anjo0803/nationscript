/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	convertNumber
} = require('../factory');
const IssueOption = require('./issue-option');

/**
 * Represents an issue confronting a nation.
 * @typedef {object} Issue
 * @prop {number} id Issue ID.
 * @prop {string} title Issue title.
 * @prop {string} description Issue description - the problem to be solved.
 * @prop {IssueOption.IssueOption[]} options Available answer options.
 * @prop {string[]} author Names of the nations that authored the issue.
 * @prop {string[]} editor Names of the nations that edited the issue.
 * @prop {string} imageLarge Banner code of the large image shown on the issue.
 * @prop {string} imageSmall Banner code of the small image shown on the issue.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<Issue>} A new `Issue` factory
 */
exports.create = root => new NSFactory()
	.set('id', root['id'], convertNumber)
	.onTag('TITLE', me => me
		.build('title'))
	.onTag('TEXT', me => me
		.build('description'))
	.onTag('OPTION', me => me
		.build('options', val => {
			let alreadyThere = me.get('options');
			if(alreadyThere === undefined) return [val];
			return [...me.get('options'), val];
	}))
	.onTag('AUTHOR', me => me
		.build('author', val => val.split(', ')))
	.onTag('EDITOR', me => me
		.build('editor', val => val.split(', ')))
	.onTag('PIC1', me => me
		.build('imageLarge'))
	.onTag('PIC2', me => me
		.build('imageSmall'));
