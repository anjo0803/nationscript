/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const Factory = require('../factory');
const Nation = require('./nation');
const types = require('../types');

/**
 * @type {import('../requests/dump').DumpFactoryConstructor<types.DumpNation>}
 * @ignore
 */
exports.createArray = (decider) => (root) => new Factory.DumpFactory(decider)
	.onTag('NATION', (me, attrs) => me
		.build('')
		.assignSubFactory(Nation.create([])(attrs)));
