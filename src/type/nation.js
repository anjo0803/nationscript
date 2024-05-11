/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	NSFactory,
	ArrayFactory,
	convertNumber,
	convertBoolean,
	convertArray
} = require('../factory');
const { NationShard } = require('../shards');
const types = require('../types');

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
 * Since the Nation API returns capital, leader, and religion data and their
 * explicitly custom couterparts in identical tag names, parsing their contents
 * into the proper properties requires tracking of the originally requested
 * shards, since in any case one is always returned before the other.
 * @arg {string[]} shards Shards requested in the original request
 * @returns {import('../factory').FactoryConstructor<types.Nation>}
 * @ignore
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
