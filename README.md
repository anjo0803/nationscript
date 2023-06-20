# ALfoNS
>**A**PI **L**ibrary **fo**r **N**ation**S**tates *(yes, this is the best I could come up with :P)*

ALfoNS is a Node.js library  that is meant to make interactions with the NS API beginner-friendly -
taking care of rate-limiting, adding full typing to API responses, and providing a variety of enums
for easy requests-building and understanding of responses - while also offering additional methods
and customisation for API interactions to support more advanced and/or niche use cases.

The current ALfoNS version (1.0.1) is tailored to version `12` of the NS API and supports all
endpoints it offers.

## Installation
ALfoNS is available via npm:
```
npm install alfons.js
```

## Usage
Before making any requests to the API, be sure to set a custom user agent that allows NationStates
staff to contact you in case anything goes wrong with your script:
```js
const { NS } = require('alfons.js');
NS.setAgent('Tepertopia Example Script');
```
Doing so [is mandatory](https://www.nationstates.net/pages/api.html#terms) and ALfoNS will not
execute any (although allow preparation of) requests before a user agent has been set.

### Request Initialisation
To begin building a request, use one of the functions on the `NS` object - each of them returns a
request subclass instance specifically adjusted to the API endpoint it is expected to address:

| API Endpoint   | Instantiation Function                                                      |
| -------------- | --------------------------------------------------------------------------- |
| Nations        | `nation`                                                                    |
| Regions        | `region`                                                                    |
| World          | `world`                                                                     |
| World Assembly | `wa`                                                                        |
| Cards (Single) | `cardDetails`                                                               |
| Cards (World)  | `cards`                                                                     |
| Commands       | `issue`, `dispatchAdd`, `dispatchEdit`, `dispatchRemove`, `giftCard`, `rmb` |
| Telegrams      | `tg`                                                                        |
| Data Dumps     | `nationsFromDump`, `regionsFromDump`, `cardsFromDump`                       |
| Miscellaneous  | `v` (Version), `ua` (UserAgent)                                             |

### Sharding & Setting Other Parameters
After instantiating it, you can chain additional function calls on the request instance in order to
add shards or other special parameters to the request:
```js
let n = NS.nation('Tepertopia')
	.shard(NationShard.REGION, NationShard.CENSUS) // Requesting custom shards, for which then a
	.setCensusScales(CensusScale.RELIGIOUSNESS);   // special parameter (e.g. census scale) is set
```
In this case, use of the `NationShard` and `CensusScale` enums is made - ALfoNS offers shard enums
for all shardable request types (nation, region, world, wa, cardDetails, and cards), in addition to
a variety of other enums for string or number ID values that generally help to craft requests to or
read responses from the API.

### Authentication
If you're requesting a nation private shard or want to execute a nation private command, you need
to authenticate the request at some point before executing it. The `NSCredential` class offers an
organised way of storing login and session PIN information for a nation, and is used whenever
authentication is required:
```js
let login = new NSCredential('Example Nation', 'password', 'autologin');

let n = NS.nation('Example Nation')
	.shard(NationPrivateShard.PING)
	.authenticate(login);

let c = NS.issue(123, login); // Commands must be authenticated at instantiation already.
```
The `NSCredential` instance that is used for authentication automatically gets its `pin` property
updated whenever an authenticated request to the API is successful.

### Execution & Response
Once you've fully built your desired request, send it to the API:
```js
let nationData = await n.send(); // Returns a Promise of a Nation object
```
Responses from the API are converted to custom object types according to what you requested - all
of them fully defined using [JSDoc](https://jsdoc.app/), so you can just use your editor's
intellisense without having to memorise the exact makeup of API responses:
```js
console.log(nationData.region);     // Print the name of the nation's region
for(let scale of nationData.census) // Print the score and world-wide rank of the nation
	console.log(`Scored ${scale.score} on scale ${scale.id} (rank #${scale.rankWorld})`);
```

## Alternative Methods
ALFoNS also offers alternative ways of getting the data you want!

### Custom Request Building
If you'd like to build your requests in a more low-level way, the `.custom()` function of the `NS`
object got your back! It instantiates a very basic `ParameterRequest`, on which you're able to use
the `.setArgument(key, val)` function to add shards or any other additional parameter for the API:
```js
let custom = await NS.custom()
	.setArgument('region', 'the_south_pacific') // Names will NOT be converted automatically here!
	.setArgument('q', 'flag+messages')
	.setArgument('offset', '5')
	.send('REGION'); // Automatic response parsing requires you to specify the expected root tag.
```
The `.setArgument(key, val)` function is also available on all of the specialised request classes,
so it's possible to mix and match in any way you want!

### Raw Responses
Using the `.raw()` function instead of `.send()` on any request instance enables you to receive the
raw response from the API in place of the automatic conversion to ALfoNS objects:
```js
let response = await NS.nation('Tepertopia').raw();
```
This will return an `IncomingMessage` instance (from the node native `http` module), which contains
everything from headers to the response body (in the form of a readable stream).

### Extracting Query Parameters
Finally, if you'd just like to use ALfoNS to build request bodies in an easier fashion while still
handling everything regarding communication with the API yourself, you can simply get the assembled
request body from any request object by using its `.getBody()` function:
```js
let body = NS.nation('Tepertopia')
	.shard(NationShard.CENSUS)
	.setCensusScales(CensusScale.RELIGIOUSNESS)
	.getBody();
console.log(body); // 'nation=tepertopia&q=census&scale=32'
```

## Settings Configuration
In addition to the different ways of usage, you can also change a number of settings to adapt
ALfoNS to your specific use case:

### Disabling The Built-In Rate-Limiter
If you would like to rate-limit your requests to the NS API externally, you can disable the
built-in rate-limiter of ALfoNS:
```js
NS.setUseRateLimit(false);
NS.setUseRateLimit(true); // ... and re-enable it any time you'd like!
```

### Using A Specific API Version
You can configure ALfoNS to always call a specific version of the NS API in requests, like so:
```js
NS.setUseVersion(11);
NS.setUseVersion(null);	// This will make all calls to the latest API version.
```
By default, all requests are made in API version `12` (as of coding, the latest version) in order
to ensure safe conversion of API response XML to the ALfoNS custom object types.

### Output Directory of Dump Copies
When querying Daily Data Dumps in the `DumpMode.DOWNLOAD`, `DumpMode.DOWNLOAD_IF_CHANGED`, or
`DumpMode.LOCAL_OR_DOWNLOAD` modes, ALfoNS will save and look for local copies of the queried Data
Dump in a folder called `nsdumps` in the directory from which the respective script is being
executed. You can set an alternative folder to contain local Dump copies instead:
```js
NS.setDumpDirectory('/path/to/directory');
```

## License
ALfoNS is licensed under the [Mozilla Public License 2.0](https://mozilla.org/MPL/2.0/).
