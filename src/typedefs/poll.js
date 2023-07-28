const {
	handleList,

	attr,
	num,
	txt
} = require('../requests/converter');

/**
 * Represents a regional poll.
 * @typedef {object} Poll
 * @prop {string} title The title of the poll.
 * @prop {string | undefined} description The (optional) description of the poll.
 * @prop {string} author Name of the nation that created the poll.
 * @prop {string} region Name of the region that the poll is running in.
 * @prop {number} opens Unix epoch timestamp for when the poll opens.
 * @prop {number} closes Unix epoch timestamp for when the poll closes.
 * @prop {PollOption[]} options List of the available {@linkcode PollOption}s to vote for.
 */
/**
 * Builds a poll object from the provided parsed response XML.
 * @param {object} root The root object - the `<POLL>` tag in the parsed XML object.
 * @returns {Poll} The built poll object.
 * @ignore
 */
exports.parsePoll = (root) => {
	return {
		title: txt(root, 'TITLE'),
		description: txt(root, 'TEXT'),
		author: txt(root, 'AUTHOR'),
		region: txt(root, 'REGION'),
		opens: num(root, 'START'),
		closes: num(root, 'STOP'),
		options: handleList(root['OPTIONS'], parsePollOption)
	}
}

/**
 * Represents a voting option on a {@linkcode Poll}.
 * @typedef {object} PollOption
 * @prop {string} text Text of the option.
 * @prop {number} votes Total number of votes for the option.
 * @prop {string[]} voters List with the names of all nations that voted for the option.
 */
/**
 * Builds a poll option object from the provided parsed response XML.
 * @param {object} option The root object - an `<OPTION>` tag in the parsed XML object.
 * @returns {PollOption} The built poll option object.
 */
function parsePollOption(option) {
	return {
		id:		parseInt(attr(option, 'ID')),
		text:	txt(option, 'OPTIONTEXT'),
		votes:	num(option, 'VOTES'),
		voters: txt(option, 'VOTERS')?.split(':') ?? []
	}
}
