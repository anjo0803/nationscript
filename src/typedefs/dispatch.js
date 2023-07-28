const { DispatchSubcategory } = require('../enums');
const {
	attr,
	num,
	txt
} = require('../requests/converter');

/**
 * Represents a dispatch.
 * @typedef {object} Dispatch
 * @prop {number} id ID of the dispatch.
 * @prop {string} title The dispatch's title.
 * @prop {string} author Name of the nation that published the dispatch.
 * @prop {string} category {@linkcode DispatchSubcategory} the dispatch is published under.
 * @prop {string} body Body text of the dispatch.
 * @prop {number} posted Unix epoch timestamp of when the dispatch was originally published.
 * @prop {number} edited Unix epoch timestamp of when the dispatch was last edited.
 * @prop {number} views Number of times the dispatch was viewed by nations other than its author.
 * @prop {number} score The dispatch's score - itd number of upvotes minus its number of downvotes.
 */
/**
 * Builds a dispatch object from the provided parsed response XML.
 * @param {object} scale The root object - a `<DISPATCH>` tag in the parsed XML object.
 * @returns {Dispatch} The built dispatch object.
 * @ignore
 */
exports.parseDispatch = (obj) => {
	return {
		id: parseInt(attr(obj, 'ID')),
		title:		txt(obj, 'TITLE'),
		author:		txt(obj, 'AUTHOR'),
		category:	`${txt(obj, 'CATEGORY')}:${txt(obj, 'SUBCATEGORY')}`,
		body:		txt(obj, 'TEXT'),
		posted:		num(obj, 'CREATED'),
		edited:		num(obj, 'EDITED'),
		views:		num(obj, 'VIEWS'),
		score:		num(obj, 'SCORE')
	};
}
