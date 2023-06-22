const { num } = require('../requests/converter');

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
 * Builds an HDI data object from the provided parsed response XML.
 * @param {object} root The - due to the response XML structure - actual root object.
 * @returns {HDIData} The built HDI data object.
 */
exports.parseHDI = (root) => {
	return {
		score:		num(root, 'HDI'),
		economy:	num(root, 'HDI-ECONOMY'),
		education:	num(root, 'HDI-SMART'),
		lifespan:	num(root, 'HDI-LIFESPAN')
	}
}
