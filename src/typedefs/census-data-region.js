const { CensusScale } = require('../enums');
const {
	attr,
	num
} = require('../requests/converter');

/**
 * Container object holding data on a region's performance on a World Census scale,
 * depending on its residents' scores on it.
 * @typedef {object} CensusDataRegion
 * @prop {number} id ID of the {@linkcode CensusScale} the rank is for.
 * @prop {number} average Average score of the region's residents on the scale.
 * @prop {number} rank Rank of the region on the scale.
 * @prop {number} rankPercent Percentile of the region on the scale. 
 */
/**
 * Builds a rank object from the provided parsed response XML.
 * @param {object} scale The root object - a `<SCALE>` tag in the parsed XML object.
 * @returns {CensusDataRegion} The built rank object.
 */
exports.parseCensusRegion = (scale) => {
	return {
		id:			parseInt(attr(scale, 'ID')),
		average:	num(scale, 'SCORE'),
		rank:		num(scale, 'RANK'),
		rankPercent:num(scale, 'PRANK')
	};
}
