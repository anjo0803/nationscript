const {
	handleList,

	attr,
	txt
} = require('../requests/converter');

/**
 * Represents an issue confronting a nation.
 * @typedef {object} Issue
 * @prop {number} id ID of the issue.
 * @prop {string} title Title of the issue, shown as a newspaper headline.
 * @prop {string} description Body text describing the premise of the issue.
 * @prop {IssueOption[]} options {@linkcode IssueOption}s available to the nation as answers.
 * @prop {string} author Name of the nation that authored the issue.
 * @prop {string} editor Name of the nation that edited the issue for publication.
 * @prop {string[]} images List of banner image codes for the issue, shown as newspaper pictures.
 */
/**
 * Builds an issue object from the provided parsed response XML.
 * @param {object} issue The root object - an `<ISSUE>` tag in the parsed XML object.
 * @returns {Issue} The built issue object.
 */
exports.parseIssue = (issue) => {
	return {
		id:			parseInt(attr(issue, 'ID')),
		title:		txt(issue, 'TITLE'),
		description:txt(issue, 'TEXT'),
		options:	handleList(issue['OPTION'], parseIssueOption),
		author:		txt(issue, 'AUTHOR'),
		editor:		txt(issue, 'EDITOR'),
		images: [
			txt(issue, 'PIC1'),
			txt(issue, 'PIC2')
		]
	};
}

/**
 * Represents an option that may be chosen to answer an {@linkcode Issue}.
 * @typedef {object} IssueOption
 * @prop {number} id Issue-internal ID of the option.
 * @prop {string} text Body text describing the option.
 */
/**
 * Builds an issue option object from the provided parsed response XML.
 * @param {object} option The root object - an `<OPTION>` tag in the parsed XML object.
 * @returns {IssueOption} The built issue option object.
 */
function parseIssueOption(option) {
	return {
		id: attr(option, 'ID'),
		text: option['$text']
	};
}
