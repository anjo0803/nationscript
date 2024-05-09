/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	Admirable,
	CensusScale,
	Influence,
	Notable,
	Sensibility,
	WAStatus,
	WAVote
} = require('../enums');

const {
	NSFactory,
	ArrayFactory,
	convertNumber,
	convertBoolean,
	convertArray
} = require('../factory');

const CensusDataNation = require('./census-data-nation');
const DeathData = require('./death-data');
const ListDispatch = require('./dispatch-list-item');
const FreedomsTextData = require('./freedoms-descriptions');
const FreedomsScoreData = require('./freedoms-scores');
const SpendingData = require('./spending-data');
const Happening = require('./happening');
const Issue = require('./issue');
const ListIssue = require('./issue-list-item');
const Notice = require('./notice');
const Policy = require('./policy');
const CensusRankUnscored = require('./census-rank-unscored');
const SectorsData = require('./sectors-data');
const UnreadsData = require('./unreads-data');
const WABadge = require('./badge-wa');
const ZombieDataNation = require('./zombie-data-nation');

/**
 * Container object holding data on the different component scores that
 * ultimately combine into a nation's final World Census HDI score.
 * @typedef {object} HDIData
 * @prop {number} score The final HDI score.
 * @prop {number} economy The economic score component.
 * @prop {number} education The educational score component.
 * @prop {number} lifespan The life expectancy score component.
 */
/**
 * Represents a nation in the NationStates multiverse, containing all the data
 * requested from the Nation API.
 * @typedef Nation
 * @prop {string} idForm Name of this nation in `id_form`.
 * @prop {string} [admirable] Random {@link Admirable} of the nation.
 * @prop {string[]} [admirables] All {@link Admirable}s of the nation.
 * @prop {string} [animal] National animal of the nation.
 * @prop {string} [animalTrait] Behaviour of the national animal.
 * @prop {string} [banner] Banner code of the banner to display for the nation.
 *     If the nation has set a primary banner, this is always the code of that
 *     primary banner; otherwise, it is randomly selected from all banners the
 *     nation has unlocked and not turned off.
 * @prop {string[]} [banners] Banner codes of all banners the nation has
 *     unlocked and not turned off. If the nation has set a primary banner, the
 *     banner code of it is listed first.
 * @prop {string} [category] World Census category of the nation, e.g. *New
 *     York Times Democracy*.
 * @prop {string} [crime] Textual description of crime levels in the nation.
 * @prop {string} [currency] Name of the nation's currency.
 * @prop {number} [dbID] Database ID of the nation.
 * @prop {string} [demonymAdjective] The adjective demonym for the nation.
 * @prop {string} [demonymNoun] The singluar noun demonym for the nation.
 * @prop {string} [demonymPlural] The plural noun demonym for the nation.
 * @prop {number} [dispatchNum] Number of extant dispatches the nation wrote.
 * @prop {string[]} [dossierNations] Nations in the dossier of the nation
 *     (`id_form`).
 * @prop {string[]} [endorsements] Nations endorsing this nation (`id_form`).
 * @prop {number} [factbookNum] Number of extant factbooks the nation authored.
 * @prop {number} [firstLogin] Timestamp of the nation's first login.
 * @prop {string} [flag] Absolute URL of the national flag image file.
 * @prop {string} [founded] Textual description of when the nation was founded,
 *     relative to now.
 * @prop {number} [foundedTimestamp] Timestamp of the nation's founding.
 * @prop {string} [nameFull] Full name of the nation.
 * @prop {string} [voteGA] {@link WAVote} of the nation in the GA.
 * @prop {number} [gdp] GDP of the nation.
 * @prop {string} [government] Textual description of what the national
 *     government is doing.
 * @prop {string} [spendingPriority] Single largest field within the nation's
 *     {@link Nation#expenditure expenditure}.
 * @prop {number} [incomeAverage] Average income of national citizens.
 * @prop {string} [descriptionIndustry] Textual description of the economic
 *     situation in the nation.
 * @prop {string} [influence] {@link Influence} the nation has in its region.
 * @prop {number} [issuesAnswered] Number of issues the nation has answered.
 * @prop {string} [lastLogin] Textual description of the time of the nation's
 *     last login, relative to now.
 * @prop {number} [lastLoginTimestamp] Timestamp of the nation's last login.
 * @prop {string[]} [legislation] Effect lines of the nation's four most
 *     recently answered issues.
 * @prop {string} [majorIndustry] Largest industry in the nation.
 * @prop {string} [motto] National motto.
 * @prop {string} [name] Name of the nation (`Proper Form`).
 * @prop {string} [nextIssue] Textual description of when the nation will face
 *     its next issue, relative to now.
 * @prop {number} [nextIssueTime] Timestamp for when the nation will face its
 *     next issue.
 * @prop {string} [notable] Random {@link Notable} the nation is eligible for.
 * @prop {string[]} [notables] All {@link Notable}s the nation is eligible for.
 * @prop {number} [packs] Number of unopened card packs the nation has.
 * @prop {boolean} [ping] `true` if the ping to the nation was successful,
 *     otherwise `false`.
 * @prop {number} [incomePoorest] Average income of the poorest 10% of national
 *     citizens.
 * @prop {number} [population] Number of citizens the nation has, in millions.
 * @prop {number} [gdpGovernment] Percentage of the nation's GDP that is
 *     generated directly by government action.
 * @prop {string[]} [dossierRegions] Regions in the dossier of the nation
 *     (`id_form`).
 * @prop {string} [region] Region the nation resides in (`Proper Form`).
 * @prop {number} [incomeRichest] Average income of the richest 10% of national
 *     citizens.
 * @prop {string} [voteSC] {@link WAVote} of the nation in the SC.
 * @prop {string[]} [sensibilities] All {@link Sensibility} traits of national
 *     citizens.
 * @prop {number} [tax] Average income tax rate in the nation.
 * @prop {boolean} [receivesCampaign] `true` if the nation would accept the
 *     defined campaign telegram, otherwise `false`.
 * @prop {boolean} [receivesRecruit] `true` if the nation would accept the
 *     defined recruitment telegram, otherwise `false`.
 * @prop {string} [pretitle] National pretitle.
 * @prop {string} [waStatus] {@link WAStatus} of the nation.
 * @prop {string} [capital] Name of the national capital.
 * @prop {string} [capitalCustom] Custom name for the national capital, if set.
 * @prop {string} [leader] Name of the national leader.
 * @prop {string} [leaderCustom] Custom name for the national capital, if set.
 * @prop {string} [religion] Name of the national religion.
 * @prop {string} [religionCustom] Custom name for the national religion, if
 *     set.
 * @prop {boolean} [verified] `true` if a login of the nation was successfully
 *     verified, otherwise `false`.
 * @prop {CensusDataNation.CensusDataNation[]} [census] Performance of the
 *     nation on the queried {@linkcode CensusScale}s.
 * @prop {DeathData.DeathData} [deaths] Details on the causes of death in the
 *     nation.
 * @prop {ListDispatch.ListDispatch} [dispatchList] Extant dispatches the
 *     nation authored.
 * @prop {ListDispatch.ListDispatch} [factbookList] Extant factbooks the nation
 *     authored.
 * @prop {FreedomsTextData.FreedomsTextData} [freedomDescriptions] Textual
 *     descriptions of the freedom levels in the nation.
 * @prop {FreedomsScoreData.FreedomsScoreData} [freedomScores] Scores for the
 *     freedom levels in the nation.
 * @prop {SpendingData.SpendingData} [expenditure] Details of national
 *     government expenditure.
 * @prop {Happening.Happening[]} [happenings] Recent national happening events.
 * @prop {HDIData} [hdi] Composition of the nation's HDI score.
 * @prop {Issue.Issue[]} [issues] Issues currently confronting the nation.
 * @prop {ListIssue.ListIssue[]} [issueSummaries] Titles and IDs of issues
 *     currently confronting the nation.
 * @prop {Notice.Notice[]} [notices] Notices of the nation.
 * @prop {Policy.Policy[]} [policies] National policies.
 * @prop {CensusRankUnscored.CensusRankUnscored} [censusRankRegion] Rank of the
 *     nation on the day's featured {@link CensusScale} among region-mates.
 * @prop {SectorsData.SectorsData} [sectors] Composition of the nation's GDP,
 *     by sector.
 * @prop {UnreadsData.UnreadsData} [unreads] Stuff not yet acknowledged by the
 *     nation.
 * @prop {WABadge.WABadge[]} [badges] Badges awarded to the nation by the SC.
 * @prop {CensusRankUnscored.CensusRankUnscored} [censusRank] Rank of the
 *     nation on the day's featured {@link CensusScale} world-wide.
 * @prop {ZombieDataNation.ZombieDataNation} [zombie] Details on the national
 *     Z-Day performance.
 */
/**
 * @arg {import('../factory').Attributes} root Attributes on the factory's root
 * @returns {NSFactory<Nation>} A new `Nation` factory
 */
exports.create = (shards = []) => (root) => new NSFactory()
	.set('idForm', root['id'])
	.onTag('ADMIRABLE', (me) => me
		.build('admirable'))
	.onTag('ADMIRABLES', (me) => me
		.build('admirables')
		.assignSubFactory(ArrayFactory
			.primitive('ADMIRABLE')))
	.onTag('ANIMAL', (me) => me
		.build('animal'))
	.onTag('ANIMALTRAIT', (me) => me
		.build('animalTrait'))
	.onTag('BANNER', (me) => me
		.build('banner'))
	.onTag('BANNERS', (me) => me
		.build('banners')
		.assignSubFactory(ArrayFactory
			.primitive('BANNER')))
	.onTag('CATEGORY', (me) => me
		.build('category'))
	.onTag('CRIME', (me) => me
		.build('crime'))
	.onTag('CURRENCY', (me) => me
		.build('currency'))
	.onTag('DBID', (me) => me
		.build('dbID'))
	.onTag('DEMONYM', (me) => me
		.build('demonymAdjective'))
	.onTag('DEMONYM2', (me) => me
		.build('demonymNoun'))
	.onTag('DEMONYM2PLURAL', (me) => me
		.build('demonymPlural'))
	.onTag('DISPATCHES', (me) => me
		.build('dispatchNum', convertNumber))
	.onTag('DOSSIER', (me) => me
		.build('dossierNations')
		.assignSubFactory(ArrayFactory
			.primitive('NATION')))
	.onTag('ENDORSEMENTS', (me) => me
		.build('endorsements', convertArray(',')))
	.onTag('FACTBOOKS', (me) => me
		.build('factbookNum', convertNumber))
	.onTag('FIRSTLOGIN', (me) => me
		.build('firstLogin', convertNumber))
	.onTag('FLAG', (me) => me
		.build('flag'))
	.onTag('FOUNDED', (me) => me
		.build('founded'))
	.onTag('FOUNDEDTIME', (me) => me
		.build('foundedTimestamp', convertNumber))
	.onTag('FULLNAME', (me) => me
		.build('nameFull'))
	.onTag('GAVOTE', (me) => me
		.build('voteGA'))
	.onTag('GDP', (me) => me
		.build('gdp', convertNumber))
	.onTag('GOVTDESC', (me) => me
		.build('government'))
	.onTag('GOVTPRIORITY', (me) => me
		.build('spendingPriority'))
	.onTag('INCOME', (me) => me
		.build('incomeAverage', convertNumber))
	.onTag('INDUSTRYDESC', (me) => me
		.build('descriptionIndustry'))
	.onTag('INFLUENCE', (me) => me
		.build('influence'))
	.onTag('ISSUES_ANSWERED', (me) => me
		.build('issuesAnswered', convertNumber))
	.onTag('LASTACTIVITY', (me) => me
		.build('lastLogin'))
	.onTag('LASTLOGIN', (me) => me
		.build('lastLoginTimestamp', convertNumber))
	.onTag('LEGISLATION', (me) => me
		.build('legislation')
		.assignSubFactory(ArrayFactory
			.primitive('LAW')))
	.onTag('MAJORINDUSTRY', (me) => me
		.build('majorIndustry'))
	.onTag('MOTTO', (me) => me
		.build('motto'))
	.onTag('NAME', (me) => me
		.build('name'))
	.onTag('NEXTISSUE', (me) => me
		.build('nextIssue'))
	.onTag('NEXTISSUETIME', (me) => me
		.build('nextIssueTimestamp', convertNumber))
	.onTag('NOTABLE', (me) => me
		.build('notable'))
	.onTag('NOTABLES', (me) => me
		.build('notables')
		.assignSubFactory(ArrayFactory
			.primitive('NOTABLE')))
	.onTag('PACKS', (me) => me
		.build('packs', convertNumber))
	.onTag('PING', (me) => me
		.build('ping', convertBoolean))
	.onTag('POOREST', (me) => me
		.build('incomePoorest', convertNumber))
	.onTag('POPULATION', (me) => me
		.build('population', convertNumber))
	.onTag('PUBLICSECTOR', (me) => me
		.build('gdpGovernment', convertNumber))
	.onTag('RDOSSIER', (me) => me
		.build('dossierRegions')
		.assignSubFactory(ArrayFactory
			.primitive('REGION')))
	.onTag('REGION', (me) => me
		.build('region'))
	.onTag('RICHEST', (me) => me
		.build('incomeRichest', convertNumber))
	.onTag('SCVOTE', (me) => me
		.build('voteSC'))
	.onTag('SENSIBILITIES', (me) => me
		.build('sensibilities', convertArray(', ')))
	.onTag('TAX', (me) => me
		.build('tax', convertNumber))
	.onTag('TGCANCAMPAIGN', (me) => me
		.build('receivesCampaign', convertBoolean))
	.onTag('TGCANRECRUIT', (me) => me
		.build('receivesRecruit', convertBoolean))
	.onTag('TYPE', (me) => me
		.build('pretitle'))
	.onTag('UNSTATUS', (me) => me
		.build('waStatus'))
	.onTag('VERIFY', (me) => me
		.build('verified', convertBoolean))
	.onTag('CAPITAL', (me) => {
		if(!shards.includes(NationShard.CUSTOM_CAPITAL)
			|| me.get('capital') === undefined)
				return me.build('capital');
		return me.build('capitalCustom');
	})
	.onTag('LEADER', (me) => {
		if(!shards.includes(NationShard.CUSTOM_LEADER)
			|| me.get('leader') === undefined)
				return me.build('leader');
		return me.build('leaderCustom');
	})
	.onTag('RELIGION', (me) => {
		if(!shards.includes(NationShard.CUSTOM_RELIGION)
			|| me.get('religion') === undefined)
				return me.build('religion');
		return me.build('religionCustom');
	})
	.onTag('CENSUS', (me) => me
		.build('census')
		.assignSubFactory(ArrayFactory
			.complex('SCALE', CensusDataNation.create)))
	.onTag('DEATHS', (me) => me
		.build('deaths')
		.assignSubFactory(ArrayFactory
			.complex('CAUSE', DeathData.create)))
	.onTag('DISPATCHLIST', (me) => me
		.build('dispatchList')
		.assignSubFactory(ArrayFactory
			.complex('DISPATCH', ListDispatch.create)))
	.onTag('FACTBOOKLIST', (me) => me
		.build('factbookList')
		.assignSubFactory(ArrayFactory
			.complex('FACTBOOK', ListDispatch.create)))
	.onTag('FREEDOM', (me, attrs) => me
		.build('freedomDescriptions')
		.assignSubFactory(FreedomsTextData.create(attrs)))
	.onTag('FREEDOMSCORES', (me, attrs) => me
		.build('freedomScores')
		.assignSubFactory(FreedomsScoreData.create(attrs)))
	.onTag('GOVT', (me, attrs) => me
		.build('expenditure')
		.assignSubFactory(SpendingData.create(attrs)))
	.onTag('HAPPENINGS', (me) => me
		.build('happenings')
		.assignSubFactory(ArrayFactory
			.complex('HAPPENING', Happening.create)))
	.onTag('ISSUES', (me) => me
		.build('issues')
		.assignSubFactory(ArrayFactory
			.complex('ISSUE', Issue.create)))
	.onTag('ISSUESUMMARY', (me) => me
		.build('issuesSummaries')
		.assignSubFactory(ArrayFactory
			.complex('ISSUE', ListIssue.create)))
	.onTag('NOTICES', (me) => me
		.build('notices')
		.assignSubFactory(ArrayFactory
			.complex('NOTICE', Notice.create)))
	.onTag('POLICIES', (me) => me
		.build('policies')
		.assignSubFactory(ArrayFactory
			.complex('POLICY', Policy.create)))
	.onTag('RCENSUS', (me, attrs) => me
		.build('censusRankRegion')
		.assignSubFactory(CensusRankUnscored.create(attrs)))
	.onTag('SECTORS', (me, attrs) => me
		.build('sectors')
		.assignSubFactory(SectorsData.create(attrs)))
	.onTag('UNREAD', (me, attrs) => me
		.build('unreads')
		.assignSubFactory(UnreadsData.create(attrs)))
	.onTag('WABADGES', (me) => me
		.build('badges')
		.assignSubFactory(ArrayFactory
			.complex('WABADGE', WABadge.create)))
	.onTag('WCENSUS', (me, attrs) => me
		.build('censusRank')
		.assignSubFactory(CensusRankUnscored.create(attrs)))
	.onTag('ZOMBIE', (me, attrs) => me
		.build('zombie')
		.assignSubFactory(ZombieDataNation.create(attrs)))

	// Sadly these aren't grouped in their own tag, so this gotta do it
	.onTag('HDI', (me) => me
		.build('hdi.score', convertNumber))
	.onTag('HDI-ECONOMY', (me) => me
		.build('hdi.economy', convertNumber))
	.onTag('HDI-SMART', (me) => me
		.build('hdi.education', convertNumber))
	.onTag('HDI-LIFESPAN', (me) => me
		.build('hdi.lifespan', convertNumber));
