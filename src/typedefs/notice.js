/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { NoticeType } = require('../enums');
const {
	num,
	txt
} = require('../requests/converter');

/**
 * Represents a notice alert generated for a nation.
 * @typedef {object} Notice
 * @prop {string} title Title of the notice.
 * @prop {string} text Body text of the notice.
 * @prop {number} time Unix epoch timestamp of when the notice was generated.
 * @prop {string} type {@linkcode NoticeType} of the notice.
 * @prop {string} icon Type of the icon shown for the notice.
 * @prop {string} url URL to open when the notice is clicked.
 * @prop {string} who Name of the nation that caused the notice to be generated.
 * @prop {boolean} isNew Whether or not the notice was viewed by the nation before.
 * @prop {boolean} ok I have no idea.
 */
/**
 * Builds a notice object from the provided parsed response XML.
 * @param {object} notice The root object - a `<NOTICE>` tag in the parsed XML object.
 * @returns {Notice} The built notice object.
 * @ignore
 */
exports.parseNotice = (notice) => {
	return {
		title:	txt(notice, 'TITLE'),
		text:	txt(notice, 'TEXT'),
		time:	num(notice, 'TIMESTAMP'),
		type:	txt(notice, 'TYPE'),
		icon:	txt(notice, 'TYPE_ICON'),
		url:	txt(notice, 'URL'),
		who:	txt(notice, 'WHO'),
		isNew:	num(notice, 'NEW') == 1,
		ok:		num(notice, 'OK') == 1
	};
}
