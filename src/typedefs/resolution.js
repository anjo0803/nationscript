const {
	handle,
	handleList,

	arr,
	num,
	txt
} = require('../requests/converter');
const { VoteTally } = require('./vote-tally');

/**
 * Represents a resolution at-vote in or passed by a council of the World Assembly.
 * @typedef {object} Resolution
 * @prop {string} id ID of the resolution.
 * @prop {string} title Title of the resolution.
 * @prop {string} author Name of the nation that submitted the resolution.
 * @prop {string[]} coauthors List with the names of all nations declared as co-authors.
 * @prop {string} text Body text of the resolution.
 * @prop {string[]} approvals List with the names of all WA delegates approving the resolution.
 * @prop {number} submitted Unix epoch timestamp of when the resolution was submitted.
 * @prop {number} promoted Unix epoch timestamp of when voting started on the resolution.
 * @prop {number | null} implemented Unix epoch timestamp for when the resolution got passed.
 * @prop {number | null} repealed ID of the resolution that repealed this resolution.
 * @prop {string} category {@linkcode WACategory} the resolution was submitted under.
 * @prop {string} option Depending on the category, the resolution's subcategory or its target.
 * @prop {VoteSummary} vote Summary of the votes on the resolution as of now.
 */
/**
 * Builds a resolution object from the provided parsed response XML.
 * @param {object} r The root object - the `<RESOLUTION>` tag in the parsed XML object.
 * @returns {Resolution} The built resolution object.
 * @ignore
 */
exports.parseResolution = (r) => {
	if(!r) return null;
	else return {
		id:			txt(r, 'ID') ?? txt(r, 'COUNCILID'),
		title:		txt(r, 'NAME'),
		author:		txt(r, 'PROPOSED_BY'),
		coauthors:	arr(r, 'COAUTHOR') ?? [],
		text:		txt(r, 'DESC'),
		submitted:	num(r, 'CREATED'),
		promoted:	num(r, 'PROMOTED'),
		implemented:num(r, 'IMPLEMENTED') ?? null,
		repealed:	num(r, 'REPEALED_BY') ?? null,
		category:	txt(r, 'CATEGORY'),
		option:		txt(r, 'OPTION'),
		vote:		parseVoteData(r)
	}
}

/**
 * Container object holding data on current or final voting results on a {@linkcode Resolution}.
 * @typedef {object} VoteSummary
 * @prop {number} totalFor Total number of votes cast in favor of the resolution.
 * @prop {number} totalAgainst Total number of votes cast against the resolution.
 * @prop {number} totalIndividualFor Total number of nations voting in favor of the resolution.
 * @prop {number} totalIndividualAgainst Total number of nations voting against the resolution.
 * @prop {VoteTally[]} track Development of the vote totals over the course of voting.
 * @prop {VoterData} voters Names of the nations voting in favor of and against the resolution.
 * @prop {DelegateVoteSummary} delegates Details of the delegates having voted on the resolution.
 * @prop {DelegateLogVote[]} delegatesLog Full timeline of when each delegate cast their vote.
 */
/**
 * Container object holding data on the names of nations voting on a resolution.
 * @typedef {object} VoterData
 * @prop {string[]} for List with the names of all nations voting in favor of the resolution.
 * @prop {string[]} against List with the names of all nations voting against the resolution.
 */
/**
 * Builds a vote summary object from the provided parsed response XML.
 * @param {object} r The root object - the `<RESOLUTION>` tag in the parsed XML object.
 * @returns {VoteSummary} The built vote summary object.
 * @ignore
 */
function parseVoteData(r) {

	// Sub-shard 'votetrack'
	let track = undefined;
	if(r['VOTE_TRACK_FOR'] && r['VOTE_TRACK_AGAINST']) {
		track = [];
		for(let i = 0; i < r['VOTE_TRACK_FOR'].length; i++) track.push({
			for: parseInt(r['VOTE_TRACK_FOR'][i]),
			against: parseInt(r['VOTE_TRACK_AGAINST'][i])
		});
	}

	// Sub-shard 'voters'
	let voters = undefined;
	if(r['VOTES_FOR'] && r['VOTES_AGAINST']) voters = {
		for: r['VOTES_FOR'],
		against: r['VOTES_AGAINST']
	}

	// Sub-shard 'dellog'
	let dellog = r['DELLOG'] ? handleList(r['DELLOG'], parseDelegateLogVote) : undefined;

	// Sub-shard 'delvotes'
	let delvotes = r['DELVOTES_FOR'] && r['DELVOTES_AGAINST']
		? handle(r, parseDelegateVotes)
		: undefined;

	return {
		totalFor: num(r, 'TOTAL_VOTES_FOR'),
		totalAgainst: num(r, 'TOTAL_VOTES_AGAINST'),
		totalIndividualFor: num(r, 'TOTAL_NATIONS_FOR'),
		totalIndividualAgainst: num(r, 'TOTAL_NATIONS_AGAINST'),
		track: track,
		voters: voters,
		delegates: delvotes,
		delegatesLog: dellog
	}
}

/**
 * Represents an extant vote cast by a WA delegate on an at-vote {@linkcode Resolution}.
 * @typedef {object} DelegateActiveVote
 * @prop {string} delegate Name of the delegate.
 * @prop {number} weight Number of votes the delegate currently has.
 * @prop {number} timestamp Unix epoch timestamp of when the vote was cast.
 */
/**
 * Builds a delegate-vote object from the provided parsed response XML.
 * @param {object} root The root object - a `<DELEGATE>` tag in the parsed XML object.
 * @returns {DelegateActiveVote} The built delegate-vote object.
 * @ignore
 */
function parseDelegateActiveVote(v) {
	return {
		delegate:	txt(v, 'NATION'),
		weight:		num(v, 'VOTES'),
		timestamp:	num(v, 'TIMESTAMP')
	};
}

/**
 * Represents a vote cast by a WA delegate on an at-vote {@linkcode Resolution}.
 * This may be a since-overridden or a still active vote.
 * @typedef {object} DelegateLogVote
 * @prop {string} delegate Name of the delegate.
 * @prop {boolean} vote `true` if the delegate voted in favour, `false` if they voted against.
 * @prop {number} weight Number of votes the delegate currently has.
 * @prop {number} timestamp Unix epoch timestamp of when the vote was cast.
 */
/**
 * Builds a delegate-vote object from the provided parsed response XML.
 * @param {object} log The root object - an `<ENTRY>` tag in the parsed XML object.
 * @returns {DelegateLogVote} The built delegate-vote object.
 * @ignore
 */
function parseDelegateLogVote(log) {
	return {
		delegate:	txt(log, 'NATION'),
		vote:		txt(log, 'ACTION') == 'FOR',
		weight:		num(log, 'VOTES'),
		timestamp:	num(log, 'TIMESTAMP')
	};
}

/**
 * Container object holding data on the currently active votes
 * of WA delegates on an at-vote {@linkcode Resolution}.
 * @typedef {object} DelegateVoteSummary
 * @prop {DelegateActiveVote[]} for Details of the delegates voting For the resolution.
 * @prop {DelegateActiveVote[]} against Details of the delegates voting Against the resolution.
 */
/**
 * Builds a delegate-vote summary object from the provided parsed response XML.
 * @param {object} root The root object - the `<RESOLUTION>` tag in the parsed XML object.
 * @returns {DelegateVoteSummary} The built delegate-vote summary object.
 * @ignore
 */
function parseDelegateVotes(root) {
	return {
		for: handleList(root['DELVOTES_FOR'], parseDelegateActiveVote),
		against: handleList(root['DELVOTES_AGAINST'], parseDelegateActiveVote)
	};
}
