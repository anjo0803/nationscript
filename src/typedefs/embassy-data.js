/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	attr,
	iterable
} = require('../requests/converter');

/**
 * Container object holding data on a region's embassies and embassy requests.
 * @typedef {object} EmbassyData
 * @prop {string[]} standing Names of the regions that share an active embassy with the region.
 * @prop {string[]} invited Names of the regions that have a pending embassy request to the region.
 * @prop {string[]} requested Names of the regions the region sent a pending embassy request to.
 * @prop {string[]} rejected Names of the regions whose embassy requests the region rejected.
 * @prop {string[]} denied Names of the regions who denied the region's embassy request.
 * @prop {string[]} opening Names of the regions with which embassies are currently opening.
 * @prop {string[]} closing Names of the regions with which embassies are currently closing.
 */
/**
 * Builds the embassies object from the provided parsed response XML.
 * @param {object} p The root object - the embassies tag in the parsed XML object.
 * @returns {EmbassyData} The built embassies object.
 * @ignore
 */
exports.parseEmbassies = (embassies) => {
	let ret = {
		standing: [],
		invited: [],
		requested: [],
		rejected: [],
		denied: [],
		opening: [],
		closing: []
	}
	if(iterable(embassies)) for(let embassy of embassies) {
		if(typeof embassy === 'string') ret.standing.push(embassy);
		else switch(attr(embassy, 'TYPE')) {
			case 'denied':		ret.denied.push(embassy['$text']); break;
			case 'invited':		ret.invited.push(embassy['$text']); break;
			case 'closing':		ret.closing.push(embassy['$text']); break;
			case 'pending':		ret.opening.push(embassy['$text']); break;
			case 'requested':	ret.requested.push(embassy['$text']); break;
			case 'rejected':	ret.rejected.push(embassy['$text']); break;
		}
	}
	return ret;
}
