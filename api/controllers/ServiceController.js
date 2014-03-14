/**
 * HomeController
 *
 * @module		:: Controller
 * @description	:: System service info API.
 */
var version = require('../../package.json').version;

module.exports = {
	info: function (req, res) {
		res.json({
			name: 'GreenCubes API',
			version: version,
			supportUrl: 'https://greencubes.org',
			authors: {
				realisation: {
					name: 'Kern0',
					url: 'http://kern0.ru',
				},
				inspiration: [
					{
						url: 'http://gcmap.ru',
						author: 'Allintop'
					},
					{
						url: 'http://gc-card.ru',
						author: 'BloodyAvenger'
					}
				]
			},
			king: 'Drbadnick',
			fullInfo: 'http://kern0.co/gcapi-fullinfo'
		});
	}
};
