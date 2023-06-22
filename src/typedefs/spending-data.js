const { num } = require('../requests/converter');

/**
 * Container object for data on a nation's government expenditure by percentage per field.
 * @typedef {object} SpendingData
 * @prop {number} admin Percentage of budget spent on the bureaucracy.
 * @prop {number} defence Percentage of budget spent on defence.
 * @prop {number} education Percentage of budget spent on education.
 * @prop {number} nature Percentage of budget spent on environmental stuff.
 * @prop {number} healthcare Percentage of budget spent on the healthcare system.
 * @prop {number} industry Percentage of budget spent on corporate welfare.
 * @prop {number} aid Percentage of budget spent on providing international aid.
 * @prop {number} order Percentage of budget spent on law enforcement.
 * @prop {number} transport Percentage of budget spent on the public transport system.
 * @prop {number} social Percentage of budget spent on social policy.
 * @prop {number} religion Percentage of budget spent on spiritual policy.
 * @prop {number} welfare Percentage of budget spent on the welfare system.
 */
/**
 * Builds a spending object from the provided parsed response XML.
 * @param {object} root The root object - the `<GOVT>` tag in the parsed XML object.
 * @returns {SpendingData} The built spending object.
 */
exports.parseSpending = (root) => {
	return {
		admin:		num(root, 'ADMINISTRATION'),
		defence:	num(root, 'DEFENCE'),
		education:	num(root, 'EDUCATION'),
		nature:		num(root, 'ENVIRONMENT'),
		healthcare:	num(root, 'HEALTHCARE'),
		industry:	num(root, 'COMMERCE'),
		aid:		num(root, 'INTERNATIONALAID'),
		order:		num(root, 'LAWANDORDER'),
		transport:	num(root, 'PUBLICTRANSPORT'),
		social:		num(root, 'SOCIALEQUALITY'),
		religion:	num(root, 'SPIRITUALITY'),
		welfare:	num(root, 'WELFARE')
	};
}
