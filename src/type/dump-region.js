/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { ArrayFactory } = require('../factory');
const Region = require('./region');
const Embassy = require('./embassy');

/**
 * Represents a region in the NationStates multiverse, containing all the data
 * saved for the region in the requested Daily Dump.
 * @typedef {object} DumpRegion
 * @prop {?string} bannerID ID of the regional banner. If the region doesn't
 *     fly a custom banner, `null`.
 * @prop {string} bannerURL Relative URL of the regional banner image file.
 * @prop {?string} delegateName Nation serving as the regional WA Delegate
 *     (`id_form`). If there is no Delegate, `null`.
 * @prop {string[]} delegateAuthorities {@link OfficerAuthority} codes for the
 *     office of regional WA Delegate.
 * @prop {number} delegateVotes Number of votes the regional WA Delegate has.
 * @prop {string} wfe Body text of the region's World Factbook Entry.
 * @prop {string} flag Absolute URL of the regional flag image file.
 * @prop {boolean} isFrontier `true` if the region is a frontier, otherwise
 *     `false`.
 * @prop {?string} governor Nation serving as the regional governor
 *     (`id_form`). If the region has no governor, `null`.
 * @prop {number} updateLast Timestamp of when the region last updated.
 * @prop {number} updateMajor Timestamp of when the region last updated in the
 *     course of a Major update.
 * @prop {number} updateMinor Timestamp of when the region last updated in the
 *     course of a Minor update.
 * @prop {string} name Name of the region (`Proper Form`).
 * @prop {string[]} nations Nations residing in the region (`id_form`).
 * @prop {number} nationsNum Number of nations residing in the region.
 * @prop {string} powerLevel Textual description of the total influence among
 *     nations in the region.
 * @prop {Embassy.Embassy} embassies Embassies the region has with
 *     others.
 * @prop {?string} founder Nation that founded the region (`id_form`). If there
 *     is no founder, `null`.
 * @prop {import('./officer').Officer[]} officers Regional officers.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {ArrayFactory<DumpRegion>} A new `DumpRegion` factory
 */
exports.createArray = (root) => ArrayFactory.complex('REGION', Region.create);
