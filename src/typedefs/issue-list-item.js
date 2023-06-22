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
 */
exports.parseSummary = (issue) => {
	return {
		id: parseInt(attr(issue, 'ID')),
		title: issue['$text']
	};
}
