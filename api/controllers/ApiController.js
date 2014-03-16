/**
 * ApiController
 *
 * @module		:: Controller
 * @description	:: Web-API API.
 */
var version = require('../../package.json').version;

module.exports = {

	info: function (req, res) {
		res.json({
			name: 'GreenCubes API',
			version: version,
			documentation_url: 'https://wiki.greencubes.org/API',
			authors: [
				{
					name: 'Arseniy Maximov (Kern0)',
					homepage_url: 'http://kern0.ru',
					blog_url: 'http://kern0.co'
				}
			],
			king: 'Drbadnick'
		});
	}
};
