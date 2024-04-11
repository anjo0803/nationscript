/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { attr } = require('../requests/converter');

/**
 * Represents an issue by title and ID.
 * @typedef {object} ListIssue
 * @prop {number} id ID of the issue.
 * @prop {string} title Title of the issue, shown as a newspaper headline.
 */
/**
 * Builds an issue summary object from the provided parsed response XML.
 * @param {object} issue The root object - an `<ISSUE>` tag in the parsed XML object.
 * @returns {ListIssue} The built issue summary object.
 * @ignore
 */
exports.parseSummary = (issue) => {
	return {
		id: parseInt(attr(issue, 'ID')),
		title: issue['$text']
	};
}
