/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const {
	CensusScale
} = require('../enums');
const {
	NSFactory,
	convertNumber
} = require('../factory');
const types = require('../types');

/**
 * @type {import('../factory').FactoryConstructor<types.Trophy>}
 * @ignore
 */
exports.create = (root) => new NSFactory()
	.set('census', root['type']?.replace?.(/-\dT?$/, ''), translateCensusName)
	.set('percent', root['type']?.replace?.(/\D*/, ''), convertNumber)
	.build('rank', convertNumber);

/**
 * Matches the given scale name, as displayed for census trophies in the
 * seasonal card dump, with its {@link CensusScale} ID.
 * @arg {string} name Name of the census
 * @returns {number} Matching census scale ID
 * @ignore
 */
function translateCensusName(name) {
	switch(name) {
		case 'ADVANCED': return CensusScale.SCIENTIFIC_ADVANCEMENT;
		case 'AGRICULTURE': return CensusScale.SECTOR_AGRICULTURE;
		case 'AID': return CensusScale.FOREIGN_AID;
		case 'APATHETIC': return CensusScale.POLITICAL_APATHY;
		case 'ARMED': return CensusScale.WEAPONIZATION;
		case 'ARMS': return CensusScale.INDUSTRY_ARMS;
		case 'AUTHORITARIAN': return CensusScale.AUTHORITARIANISM;
		case 'AUTO': return CensusScale.INDUSTRY_AUTOMOBILE;
		case 'AVERAGE': return CensusScale.AVERAGENESS;
		case 'AVOIDED': return CensusScale.CHARMLESSNESS;
		case 'BASKET': return CensusScale.INDUSTRY_BASKET;
		case 'BLACKMARKET': return CensusScale.BLACK_MARKET;
		case 'BUSINESS': return CensusScale.BUSINESS_SUBSIDIZATION;
		case 'CHEESE': return CensusScale.INDUSTRY_CHEESE;
		case 'COMPASSIONATE': return CensusScale.COMPASSION;
		case 'CONSERVATIVE': return CensusScale.SOCIAL_CONSERVATISM;
		case 'CORRUPT': return CensusScale.CORRUPTION;
		case 'CRIME': return CensusScale.CRIME;
		case 'CULTURE': return CensusScale.CULTURE;
		case 'DEATH': return CensusScale.DEATH_RATE;
		case 'DECK': return CensusScale.INTERNATIONAL_ARTWORK;
		case 'DEFENSE': return CensusScale.DEFENSE_FORCES;
		case 'DEVOUT': return CensusScale.RELIGIOUSNESS;
		case 'DISPINCOME': return CensusScale.AVERAGE_DISPOSABLE_INCOME;
		case 'DRUGS': return CensusScale.RECREATIONAL_DRUG_USE;
		case 'INCOME': return CensusScale.AVERAGE_INCOME;
		case 'ECO-GOVT': return CensusScale.ECO_FRIENDLINESS;
		case 'ECONOMY': return CensusScale.ECONOMY;
		case 'EDUCATED': return CensusScale.PUBLIC_EDUCATION;
		case 'EMPLOYED': return CensusScale.EMPLOYMENT;
		case 'ENDORSED': return CensusScale.WORLD_ASSEMBLY_ENDORSEMENTS;
		case 'ENVIRONMENT': return CensusScale.ENVIRONMENTAL_BEAUTY;
		case 'EQUALITY': return CensusScale.INCOME_EQUALITY;
		case 'EXTREME': return CensusScale.IDEOLOGICAL_RADICALITY;
		case 'FAT': return CensusScale.OBESITY;
		case 'FISH': return CensusScale.INDUSTRY_TROUT;
		case 'FOODQUALITY': return CensusScale.FOOD_QUALITY;
		case 'FURNITURE': return CensusScale.INDUSTRY_FURNITURE;
		case 'GAMBLING': return CensusScale.INDUSTRY_GAMBLING;
		case 'GDP': return CensusScale.ECONOMIC_OUTPUT;
		case 'GODFORSAKEN': return CensusScale.SECULARISM;
		case 'GOVT': return CensusScale.GOVERNMENT_SIZE;
		case 'HAPPY': return CensusScale.CHEERFULNESS;
		case 'HDI': return CensusScale.HUMAN_DEVELOPMENT_INDEX;
		case 'HEALTHCARE': return CensusScale.PUBLIC_HEALTHCARE;
		case 'HEALTHY': return CensusScale.HEALTH;
		case 'HIGHTAX': return CensusScale.TAXATION;
		case 'INCLUSIVE': return CensusScale.INCLUSIVENESS;
		case 'INFLUENCE': return CensusScale.INFLUENCE;
		case 'INSURANCE': return CensusScale.INDUSTRY_INSURANCE;
		case 'LEASTCORRUPT': return CensusScale.INTEGRITY;
		case 'LIBERAL': return CensusScale.CIVIL_RIGHTS;
		case 'LIFE': return CensusScale.LIFESPAN;
		case 'LOWCRIME': return CensusScale.COMPLIANCE;
		case 'LOWTAX': return CensusScale.FREEDOM_FROM_TAXATION;
		case 'MANUFACTURING': return CensusScale.SECTOR_MANUFACTURING;
		case 'MINING': return CensusScale.INDUSTRY_MINING;
		case 'NICE': return CensusScale.NICENESS;
		case 'NUDE': return CensusScale.NUDITY;
		case 'PATRIOTISM': return CensusScale.PATRIOTISM;
		case 'PEACE': return CensusScale.PACIFISM;
		case 'PIZZA': return CensusScale.INDUSTRY_PIZZA;
		case 'POPULATION': return CensusScale.POPULATION;
		case 'POLICE': return CensusScale.LAW_ENFORCEMENT;
		case 'POLIFREE': return CensusScale.POLITICAL_FREEDOM;
		case 'POORINCOME': return CensusScale.AVERAGE_INCOME_POOR;
		case 'PRIMITIVE': return CensusScale.PRIMITIVENESS;
		case 'PRO-MARKET': return CensusScale.ECONOMIC_FREEDOM;
		case 'PUBLICTRANSPORT': return CensusScale.PUBLIC_TRANSPORT;
		case 'PUBLISHING': return CensusScale.INDUSTRY_BOOK;
		case 'REBELYOUTH': return CensusScale.YOUTH_REBELLIOUSNESS;
		case 'RETAIL': return CensusScale.INDUSTRY_RETAIL;
		case 'RICHINCOME': return CensusScale.AVERAGE_INCOME_RICH;
		case 'RUDE': return CensusScale.RUDENESS;
		case 'SAFE': return CensusScale.SAFETY;
		case 'SMART': return CensusScale.INTELLIGENCE;
		case 'SODA': return CensusScale.INDUSTRY_BEVERAGE;
		case 'STATIONARY': return CensusScale.RESIDENCY;
		case 'STUPID': return CensusScale.IGNORANCE;
		case 'TECH': return CensusScale.INDUSTRY_IT;
		case 'TIMBER': return CensusScale.INDUSTRY_TIMBER;
		case 'TOURISM': return CensusScale.TOURISM;
		case 'WEALTHGAPS': return CensusScale.WEALTH_GAPS;
		case 'WEATHER': return CensusScale.WEATHER;
		case 'WELFARE': return CensusScale.WELFARE;
		default: return NaN;
	}
}
