[![Documentation](https://github.com/anjo0803/nationscript/actions/workflows/deploy-docs.yml/badge.svg)](https://anjo0803.github.io/nationscript/)
[![Licence](https://img.shields.io/npm/l/nationscript)](https://github.com/anjo0803/nationscript/blob/master/LICENCE.txt)
[![Version](https://img.shields.io/npm/v/nationscript)](https://www.npmjs.com/package/nationscript)
[![Package Quality](https://packagequality.com/shield/nationscript.svg)](https://packagequality.com/#?package=nationscript)

# NationScript

NationScript is a Node.js library that is meant to make interactions with the
NationStates API beginner-friendly ‒ taking care of rate-limiting, adding full
types to API responses, and providing various enums for easier request-building
and understanding of responses ‒ while also offering additional methods and
customisation options for API interactions to support more advanced and/or
niche use cases.

NationScript is tailored to version `12` of the NS API and supports all
endpoints it offers.

## Installation
NationScript is available via npm:
```
npm install nationscript
```

## Usage
Before making any requests to the API, be sure to set a custom user agent that
allows NationStates staff to contact you in case anything goes wrong with your
script:
```js
const { NS } = require('nationscript');
NS.setAgent('Tepertopia Example Script');
```
Doing so [is mandatory](https://www.nationstates.net/pages/api.html#terms) and
NationScript will not execute any (although allow preparation of) requests
before a user agent has been set.

### Request Initialisation
To begin building a request, use one of the functions on the `NS` object ‒ each
of them returns a request subclass instance specifically adjusted to the API
endpoint it is expected to address:

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
After instantiating it, you can chain additional function calls on the request
instance in order to add shards or other special parameters to the request:
```js
const { NS, NationShard, CensusScale } = require('nationscript');
let n = NS.nation('Tepertopia')
    // Add shards to the request...
    .shard(NationShard.REGION, NationShard.CENSUS)
	// ...and configure additional options for those shards
    .setCensusScales(CensusScale.RELIGIOUSNESS);
```
Here, the `NationShard` and `CensusScale` enums are used to quickly reference
the values expected by the API for these cases. NationScript offers shard enums
for all shardable request types (nation, region, world, wa, cardDetails, and
cards), plus a variety of other enums for cases where the API expects or itself
returns values from a defined set of legal options.

### Authentication
If you're requesting a nation private shard or want to execute a nation private
command, you need to authenticate the request before executing it. The
`NSCredential` class offers an organised way of storing login and session PIN
information for a nation, and is used whenever authentication is required:
```js
let login = new NSCredential('Example Nation', 'password', 'autologin');

let n = NS.nation('Example Nation')
    .shard(NationPrivateShard.PING)
    .authenticate(login);

// Commands may also be authenticated at instantiation already!
let c = NS.issue(login);
```
The `NSCredential` instance that is used for authentication automatically gets
its `pin` property updated whenever the API returns a new `X-Pin` header.

### Execution & Response
Once you've fully built your desired request, send it to the API:
```js
let nationData = await n.send();
```
Responses from the API are converted to custom object types according to what
you requested ‒ all of them fully defined using [JSDoc](https://jsdoc.app/), so
you should be able to simply use your editor's intelligent code completion to
see which exact property corresponds to your requested data, without having to
memorise the (sometimes complicated) makeup of API responses.

## Alternative Methods
NationScript also offers alternative ways of getting the data you want!

### Custom Request Building
If you'd like to build a requests in a more low-level way, the `.custom()`
function of the `NS` object got your back! It instantiates a very basic
`ParameterRequest`, on which you're able to use the `.setArgument(key, val)`
and `.setHeader(key, val)` functions to define queries and authenticate:
```js
let custom = await NS.custom()
    .setArgument('region', 'the_south_pacific')
    .setArgument('q', 'flag+messages')
    .setArgument('offset', '5')
    .send();
```
These functions are also available on all of the specialised request classes,
so it's possible to mix and match in any way you want!

### Raw Responses
Using the `.raw()` function instead of `.send()` on any request instance
enables you to receive the raw response from the API in place of the automatic
conversion to NationScript objects:
```js
let response = await NS.nation('Tepertopia').raw();
```
This will return an `IncomingMessage` instance (from the native `node:http`
module). If enabled, the request is also still rate-limited.

## Settings Configuration
In addition to the different ways of usage, you can also change a number of
settings to adapt NationScript to your use case:

### Disabling The Built-In Rate-Limiter
If you would like to rate-limit your requests to the NS API externally, you can
disable the built-in rate-limiter of NationScript:
```js
NS.setUseRateLimit(false);
```

### Using A Specific API Version
You can configure NationScript to use a specific or the most recent version of
the NS API for all requests, like so:
```js
NS.setUseVersion(11);   // Use named version
NS.setUseVersion(null); // Use the latest version
```
By default, all requests are made in API version `12` (as of coding, the latest
version) in order to ensure a safe conversion of API response XML to the
NationScript custom object types.

### Output Directory and File Names of Dump Copies
When querying Daily Data Dumps in a `DumpMode` that may interact with local
copies of Data Dumps, NationScript will save and look for local copies of the
queried Data Dump at the path `./nsdumps`. You can set an alternative folder
to contain local Dump copies instead:
```js
NS.setDumpDirectory('path/to/directory/');
```
By default, NationScript saves and looks for Dump files according to the naming
pattern `nations_YYYY-MM-DD.xml.gz`, `regions_YYYY-MM-DD.xml.gz`, or
`cards_sX.xml.gz`, respectively. Naturally, your naming pattern may differ, so
you can define alternative patterns:
```js
NS.setDumpNameNation((date) => date.toDateString() + '-nations.xml.gz');
NS.setDumpNameRegion((date) => `r${date.toLocaleDateString()}.xml.gz`);

// The final path to the file is determined by resolving the defined directory
// with the result of the file naming function appended, so you can also save
// specific dumps in another folder
NS.setDumpNameCard((season) => `cards/season-${season}.xml.gz`);
```

## Name Conversion and Timestamps
The `NationRequest` and `RegionRequest` constructors automatically convert the
nation/region name provided to them to lowercase and replace spaces with
underscores (internally called the `id_form` of names). For data returned by
the API, the respective properties all explicitly state whether the data is in
`id_form` or `Proper Form` (properly capitalised, with normal spaces).

All timestamps returned by the API are in Unix Epoch format. Likewise, where
a timestamp may be provided *to* the API with a request, this is also expected
to be a Unix Epoch timestamp.

## Documentation
The full documentation (both for internal stuff and the actual user interface)
is available [here](https://anjo0803.github.io/nationscript/) on GitHub Pages.

## Licence
[Mozilla Public License 2.0](https://mozilla.org/MPL/2.0/).
