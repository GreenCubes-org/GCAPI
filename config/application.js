var passport = require('passport'),
	oauth2orize = require('oauth2orize'),
	login = require('connect-ensure-login'),
	utils = require('../utils.js');

module.exports = {
	express: {
		customMiddleware: function (app) {

			app.locals({
				version: require('../package.json').version,
				scripts: ['jquery.js'],
				renderJSTags: function (all) {
					if (all !== undefined) {
						return all.map(function (scripts) {
							app.locals.scripts = ['jquery.js'];
							return '<script src="/js/' + scripts + '" type="text/javascript"></script>';
						}).join('\n ');
					} else {
						return '';
					}
				},
				styles: ['sem.css'],
				renderCSSTags: function (all) {
					app.locals.styles = ['sem.css'];
					if (all !== undefined) {
						return all.map(function (styles) {
							return '<link href="/styles/' + styles + '" type="text/css" rel="stylesheet" />';
						}).join('\n ');
					} else {
						return '';
					}
				}
			});
		}
	}
};
