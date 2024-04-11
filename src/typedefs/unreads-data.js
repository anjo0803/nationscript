/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { num } = require('../requests/converter');

/**
 * Container object for data on a nation's number of unread issues, telegrams, notices, and RMB and
 * News posts, as well as the number of at-vote resolutions it has yet to vote on.
 * @typedef {object} UnreadsData
 * @prop {number} issue Total number of issues currently confronting the nation.
 * @prop {number} telegram Total number of telegrams not yet read by the nation.
 * @prop {number} notice Total number of notices not yet acknowledged by the nation.
 * @prop {number} rmb Total number of unread posts on the RMB of the nation's region.
 * @prop {number} wa Number of at-vote WA resolutions that the nation has not yet voted on.
 * @prop {number} news Total number of posts on the news page that the nation hasn't read yet.
 */
/**
 * Builds an unreads data object from the provided parsed response XML.
 * @param {object} root The root object - the `<UNREADS>` tag in the parsed XML object.
 * @returns {UnreadsData} The built unreads data object.
 * @ignore
 */
exports.parseUnreads = (root) => {
	return {
		issue:		num(root, 'ISSUES'),
		telegram:	num(root, 'TELEGRAMS'),
		notice:		num(root, 'NOTICES'),
		rmb:		num(root['RMB'], '$text'),
		wa:			num(root, 'WA'),
		news:		num(root, 'NEWS')
	};
}
