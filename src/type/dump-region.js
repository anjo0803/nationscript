/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	DumpFactory
} = require('../factory');
const types = require('../types');

const Region = require('./region');

/**
 * @type {import('../requests/dump').DumpFactoryConstructor<types.DumpRegion>}
 * @ignore
 */
exports.createArray = (decider) => (root) => new DumpFactory(decider)
	.onTag('REGION', (me, attrs) => me
		.build('')
		.assignSubFactory(Region.create(attrs)));
