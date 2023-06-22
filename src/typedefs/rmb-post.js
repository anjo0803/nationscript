const { RMBPostStatus } = require('../enums');
const {
	attr,
	num,
	txt
} = require('../requests/converter');

/**
 * Represents a message post lodged to a region's Regional Message Board.
 * @typedef {object} RMBPost
 * @prop {number} id ID of the post.
 * @prop {string} nation Name of the nation that made the post.
 * @prop {string} text Body text of the post.
 * @prop {number} likes Current number of likes on the post.
 * @prop {string[]} likers List with the names of the nations that liked the post.
 * @prop {number} timestamp Unix epoch timestamp of when the post was made.
 * @prop {number} status {@linkcode RMBPostStatus} of the post.
 * @prop {(string | null)} suppressor Name of the nation that suppressed the post, if suppressed.
 */
/**
 * Builds a RMB post object from the provided parsed response XML.
 * @param {object} msg The root object - the `<MESSAGE>` tag in the parsed XML object.
 * @returns {RMBPost} The built post object.
 */
exports.parseRMBMessage = (msg) => {
	return {
		id: parseInt(attr(msg, 'ID')),
		nation:		txt(msg, 'NATION'),
		text:		txt(msg, 'MESSAGE'),
		likes:		num(msg, 'LIKES'),
		likers:		txt(msg, 'LIKERS')?.split(',') ?? [],
		timestamp:	num(msg, 'TIMESTAMP'),
		status:		num(msg, 'STATUS'),
		suppressor:	txt(msg, 'SUPPRESSOR') ?? null
	};
}
