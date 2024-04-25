/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { ArrayFactory } = require('../factory');
const Nation = require('./nation');

const DeathData = require('./death-data');
const FreedomsTextData = require('./freedoms-descriptions');
const FreedomsScoreData = require('./freedoms-scores');
const SpendingData = require('./spending-data');

/**
 * Represents a nation in the NationStates multiverse, containing all the data
 * saved for the nation in the requested Daily Dump.
 * @typedef {object} DumpNation
 * @prop {string} name Name of the nation (`Proper Form`).
 * @prop {string} pretitle National pretitle.
 * @prop {string} nameFull Full name of the nation (`Proper Form`).
 * @prop {string} motto National motto.
 * @prop {string} category World Census category of the nation, e.g. *New York
 *     Times Democracy*.
 * @prop {string} waStatus {@link WAStatus} of the nation.
 * @prop {string[]} endorsements Nations endorsing this nation (`id_form`).
 * @prop {number} issuesAnswered Number of issues the nation has answered.
 * @prop {FreedomsTextData.FreedomsTextData} freedomDescriptions Textual
 *     descriptions of the freedom levels in the nation.
 * @prop {string} region Region the nation resides in (`Proper Form`).
 * @prop {number} population Number of citizens the nation has, in millions.
 * @prop {number} tax Average income tax rate in the nation.
 * @prop {string} animal National animal of the nation.
 * @prop {string} currency Name of the nation's currency.
 * @prop {string} demonymAdjective The adjective demonym for the nation.
 * @prop {string} demonymNoun The singluar noun demonym for the nation.
 * @prop {string} demonymPlural The plural noun demonym for the nation.
 * @prop {string} flag Absolute URL of the national flag image file.
 * @prop {string} majorIndustry Largest industry in the nation.
 * @prop {string} spendingPriority Single largest field within the nation's
 *     {@link DumpNation#expenditure expenditure}.
 * @prop {SpendingData.SpendingData} expenditure Details of national
 *     government expenditure.
 * @prop {string} founded Textual description of when the nation was founded,
 *     relative to now.
 * @prop {number} firstLogin Timestamp of the nation's first login.
 * @prop {string} lastLogin Textual description of the time of the nation's
 *     last login, relative to now.
 * @prop {number} lastLoginTimestamp Timestamp of the nation's last login.
 * @prop {string} influence {@link Influence} the nation has in its region.
 * @prop {FreedomsScoreData.FreedomsScoreData} freedomScores Scores for the
 *     freedom levels in the nation.
 * @prop {number} gdpGovernment Percentage of the nation's GDP that is
 *     generated directly by government action.
 * @prop {DeathData.DeathData} deaths Details on the causes of death in the
 *     nation.
 * @prop {string} leader Name of the national leader.
 * @prop {string} capital Name of the national capital.
 * @prop {string} religion Name of the national religion.
 * @prop {number} factbookNum Number of extant factbooks the nation authored.
 * @prop {number} dispatchNum Number of extant dispatches the nation wrote.
 * @prop {number} dbID Database ID of the nation.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {ArrayFactory<DumpNation>} A new `DumpNation` factory
 */
exports.createArray = (root) => ArrayFactory.complex('NATION', Nation.create);
