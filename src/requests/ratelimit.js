/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */




/**
 * Describes the current rate-limiting policy of the NationStates API. This gets updated
 * automatically based on the information in the headers returned from API requests, but is
 * initially set to allow 50 requests per 30 seconds, which, as of coding, is the actual limit.
 */

/* Number of milliseconds treated as one time window by the NS API. */
let period = 30000

/* Total number of requests that may be made within one time window. */
let amount = 49	// Leave space for one TG request that might come from the TG queue

/* Number of requests sent to the API in the current time window. */
let sent = 0

/* Number of requests currently waiting for the active time window to expire. */
let queued = 0

/* Unix ms timestamp for when the active time window expires. */
let expires = 0

/* Number of milliseconds to add to time window calculations as a safety buffer. */
let buffer = 200

/* Unix ms timestamp of when a new time window starts, as stated by the API. */
let retry = 0

/**
 * Pauses execution for the specified amount of time if `await`ed.
 * @arg {number} period Number of milliseconds to pause.
 * @private
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
 * Depending on how many requests have been sent to the NS API in the current API window
 * already, pauses further execution for an appropriate amount of time if `await`ed, so as to
 * not exceed the API's rate-limit.
 */
exports.enforce = async function() {
	let now = Date.now();

	// If activating a new time window, only save the expiration time and reset the data
	if(now > expires) {
		expires = now + period + buffer;
		sent = 1;
		queued = 0;
		return;
	}

	// If there's still room for requests in the current time window, just register the request
	if(sent < amount) {
		sent += 1;
		return;
	}

	/*
	 * If however the maximum number of requests has been reached for the current time window
	 * already, a queue of requests is calculated:
	 * - Firstly, check whether the current length of the queue would take up one more whole
	 *   time window, and if so, register a new expiration date to account for this new window
	 * - Then, wait the time necessary to reach the start of the next non-filled time window
	 * - If there was a rate-limit excess in the meantime and a retry time has been set, repeat
	 *   the above steps (effectively, request is re-queued at the end of the current queue)
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


let recruitment = 180000
let standard = 30000
let last = 0

/**
 * @arg {boolean} isRecruit `true` to enforce the rate-limit as required for
 *     recruitment telegrams, otherwise `false`
 */
exports.enforceTG = async function(isRecruit) {
	let now = Date.now();

	/**
	 * The TG API works slightly differently, in that it is not a flush bucket
	 * system like the general API, but simply checks whether sufficient time
	 * has passed since the last telegrams-related request.
	 */
	let wait = last + (isRecruit ? recruitment : standard) - now;
	last = now + wait + 200;
	if (wait > 0) await this.timeout(wait);
}
