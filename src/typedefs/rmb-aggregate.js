const {
	num,
	txt
} = require('../requests/converter');

/**
 * Container object holding data on a nation's aggregate RMB activity.
 * @typedef {object} RMBActivityAggregate
 * @prop {string} nation Name of the nation the data is for.
 * @prop {number} score Total number of hits for the nation for the leaderboard type.
 */
/**
 * Builds an array of nations' aggregate scores from the provided parsed response XML.
 * @param {object} obj The object to use as root.
 * @param {string} type The type of activity aggregated - `'POSTS'`, `'LIKES'`, or `'LIKED'`.
 * @returns {RMBActivityAggregate[]} The built array.
 * @ignore
 */
exports.parseRMBLeaderboard = (obj, type) => {
	if(obj.length != 1) return undefined;
	let ret = [];
	if(iterable(obj[0])) for(let n of obj[0]) ret.push({
		nation: txt(n, 'NAME'),
		score: num(n, type?.toUpperCase())
	});
	return ret;
}
