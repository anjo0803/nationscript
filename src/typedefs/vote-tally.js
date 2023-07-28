const { num } = require('../requests/converter');

/**
 * Represents a tally of votes For and Against a resolution in the World Assembly.
 * @typedef {object} VoteTally
 * @prop {number} for Number of votes in favor of the resolution. `null` if none is at vote.
 * @prop {number} against Number of votes against the resolution. `null` if none is at vote.
 */
/**
 * Builds a vote tally object from the provided parsed response XML.
 * @param {object} tally The root object - a `<GAVOTE>` or `<SCVOTE>` tag in the parsed XML object.
 * @returns {VoteTally} The built vote tally object.
 * @ignore
 */
exports.parseVoteTally = (tally) => {
	return {
		for: num(tally, 'FOR') ?? null,
		against: num(tally, 'AGAINST') ?? null
	};
}
