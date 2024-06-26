/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Provides built-in rate-limiting functionality.
 * @module nationscript/request/ratelimit
 */

const http = require('node:http');

/* === Normal Requests === */

/**
 * Number of milliseconds treated as one time window by the NS API.
 * @type {number}
 * @default 30000
 * @ignore
 */
let period = 30000

/**
 * Total number of requests that may be made within one time window.
 * @type {number}
 * @default 49
 * @ignore
 */
let amount = 49	// Leave space for one TG request

/**
 * Number of requests sent to the API in the current time window.
 * @type {number}
 * @ignore
 */
let sent = 0

/**
 * Number of requests currently waiting for the active time window to expire.
 * @type {number}
 * @ignore
 */
let queued = 0

/**
 * Timestamp of when the active time window expires.
 * @type {number}
 * @ignore
 */
let expires = 0

/**
 * Number of milliseconds to add to time window calculations as safety buffer.
 * @type {number}
 * @default 200
 * @ignore
 */
const buffer = 200

/**
 * Timestamp of when a new time window starts, as stated by the API.
 * @type {number}
 * @ignore
 */
let retry = 0

/**
 * Pauses execution for the specified amount of time if `await`ed.
 * @arg {number} period Number of milliseconds to pause
 * @ignore
 */
async function timeout(period) {
	return new Promise((resolve) => setTimeout(resolve, Math.max(0, period)));
}

/**
 * Updates the rate-limiters records with data supplied by the API.
 * @arg {http.IncomingHttpHeaders} data Headers returned
 */
function update(data) {
	let apiLimit = data['ratelimit-limit']
	if(typeof apiLimit !== 'string') return;
	amount = parseInt(apiLimit) - 1;

	let apiRemaining = data['ratelimit-remaining'];
	if(typeof apiRemaining !== 'string') return;
	let apiSent = amount - parseInt(apiRemaining) + 1;
	if(sent < apiSent) sent = apiSent;

	let apiExpire = data['ratelimit-reset'];
	if(typeof apiExpire !== 'string') return;
	let apiReset = parseInt(apiExpire) * 1000;	// is returned in seconds
	if(expires < apiReset) expires = apiReset;
}

/**
 * Enforces compliance with the API's general rate-limit.
 * 
 * Depending on how many requests have been sent to the NS API in the current
 * time window already, further execution is paused for an appropriate amount
 * of time, until a new request can be made again safely.
 */
async function enforce() {
	let now = Date.now();

	// Activation of a new time window by the current request
	if(now > expires) {
		expires = now + period + buffer;
		sent = 1;
		queued = 0;
		return;
	}

	// Current request would not exceed the number of allowed requests
	if(sent < amount) {
		sent += 1;
		return;
	}

	/*
	 * If the maximum number of requests has been reached for the current time
	 * window, a queue of requests is calculated:
	 * - Firstly, check whether the current queue would take up one more whole
	 *   time window, and if so, register a new expiration date to account for
	 *   this new window.
	 * - Then, wait until the next free time window begins.
	 * - If there was a rate-limit excess in the meantime and a retry time has
	 *   been set, repeat the above steps (effectively, request is re-queued at
	 *   the end of the current queue).
	 */
	let windowQueue;
	do {
		windowQueue = queued % amount;
		if(windowQueue === 0) expires += period + buffer;

		queued += 1;
		await timeout(expires - period - now);
		queued -= 1;
	} while (retry > (now = Date.now()))

	// Release only 4 requests per second so the API isn't completely spammed
	sent = sent % amount + 1;
	await timeout(windowQueue * 250);
}


/* === TG Requests === */

/**
 * Number of milliseconds that must have elapsed since a telegram was sent if a
 * recruitment telegram is to be sent next.
 * @type {number}
 * @default 180000
 * @ignore
 */
let recruitment = 180000

/**
 * Number of milliseconds that must have elapsed since a telegram was sent if a
 * non-recruitment telegram is to be sent next.
 * @type {number}
 * @default 30000
 * @ignore
 */
let standard = 30000

/**
 * Timestamp of when the last telegram was sent.
 * @type {number}
 * @ignore
 */
let last = 0

/**
 * Enforces compliance with the API's telegram rate-limit.
 * 
 * Depending on when the last telegram request was sent, further execution is
 * paused for an appropriate amount of time, until a new telegram request can
 * be made again safely.
 * @arg {boolean} isRecruit `true` to enforce the rate-limit as required for
 *     recruitment telegrams, otherwise `false`
 */
async function enforceTG(isRecruit) {
	let now = Date.now();

	/* 
	 * The TG API works slightly differently, in that it is not a flush bucket
	 * system like the general API, but simply checks whether sufficient time
	 * has passed since the last telegrams-related request.
	 */
	let wait = last + (isRecruit ? recruitment : standard) - now;
	last = now + wait + 200;
	if (wait > 0) await this.timeout(wait);
}

exports.update = update;
exports.enforce = enforce;
exports.enforceTG = enforceTG;
