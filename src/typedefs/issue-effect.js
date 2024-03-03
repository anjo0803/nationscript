const {
	handleList,

	arr,
	num,
	txt
} = require('../requests/converter');
const {
	parsePolicy,
	Policy
} = require('./policy');

/**
 * Represents an ongoing auction on a card.
 * @typedef {object} IssueEffect
 * @prop {boolean} ok Whether everything went alright, I guess?
 * @prop {string} legislation The legislation effect line of the chosen issue option.
 * @prop {string[]} headlines List with all generated newspaper headlines.
 * @prop {string[]} banners List with the banner codes of all newly-unlocked banners.
 * @prop {Policy[]} policiesEnacted List of all newly-enacted national policies.
 * @prop {Policy[]} policiesCancelled List of all newly-cancelled national policies.
 * @prop {RankChange[]} census List of all effects the answer had on the nation's census scores.
 * @prop {Reclassification[]} reclassifications List of all freedom level reclassifications.
 */
/**
 * Builds an issue-answer object from the provided parsed response XML.
 * @param {object} auction The root object - an `<ISSUE>` tag in the parsed XML object.
 * @returns {IssueEffect} The built issue-answer object.
 * @ignore
 */
exports.parseIssueEffect = (effect) => {
	return {
		ok:					num(effect, 'OK') === 1,
		legislation:		txt(effect, 'DESC'),
		headlines:			arr(effect, 'HEADLINES'),
		banners:			arr(effect, 'UNLOCKS'),
		policiesEnacted:	handleList(effect['NEW_POLICIES'], parsePolicy) ?? [],
		policiesCancelled:	handleList(effect['REMOVED_POLICIES'], parsePolicy) ?? [],
		census:				handleList(effect['RANKINGS'], parseRankChange) ?? [],
		reclassifications:	handleList(effect['RECLASSIFICATIONS'], parseReclassification) ?? []
	}
}

/**
 * Represents a change in a nation's performance on a World Census scale.
 * @typedef {object} RankChange
 * @prop {number} scale {@linkcode CensusScale} ID of the affected scale.
 * @prop {number} changeAbsolute Absolute score change on the scale in its units.
 * @prop {number} changeRelative Relative score change on the scale in percent.
 * @prop {number} newScore New absolute score of the nation on the scale.
 */
/**
 * Builds a rank-change object from the provided parsed response XML.
 * @param {object} change The root object - a `<RANK>` tag in the parsed XML object.
 * @returns {RankChange} The built rank-change object.
 * @ignore
 */
function parseRankChange(change) {
	return {
		scale: parseInt(attr(change, 'ID')),
		changeAbsolute:	num(change, 'CHANGE'),
		changePercent:	num(change, 'PCHANGE'),
		newScore:		num(change, 'SCORE')
	};
}

/**
 * Represents a reclassification of a nation's level of civil,
 * economic, or political freedom through an {@linkcode AnsweredIssue}.
 * @typedef {object} Reclassification
 * @prop {number} category {@linkcode ReclassificationCategory} the reclassification concerns.
 * @prop {string} from Level the freedom was on prior to answering the issue.
 * @prop {string} to Level the freedom is on after answering the issue.
 */
/**
 * Builds a reclassification object from the provided parsed response XML.
 * @param {object} root The root object - a `<RECLASSIFY>` tag in the parsed XML object.
 * @returns {Reclassification} The built reclassification object.
 * @ignore
 */
function parseReclassification(root) {
	return {
		category:	attr(root, 'TYPE'),
		from:		txt(root, 'FROM'),
		to:			txt(root, 'TO')
	}
}
