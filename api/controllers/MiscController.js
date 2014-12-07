/**
 * MiscController
 *
 * @module		:: Controller
 * @description	:: Miscellaneous API's.
 */

var version = require('../../package.json').version,
	git = require('git-rev');

module.exports = {

	info: function (req, res) {
		var obj = {
			commit: null,
			tag: null
		}
		async.waterfall([

			function getCommit(callback) {
				git.short(function (result) {
					obj.commit = result;
					callback(null, obj);
				});
			},
			function getVersion(obj, callback) {
				obj.tag = version;
				callback(null, obj);
			}
		], function (err, obj) {
			res.json({
				version: obj.tag + '-' + obj.commit,
				documentation_url: docs_url,
				authors: [
					{
						name: 'Arseniy Maximov (Kern0)',
						homepage_url: 'http://kern0.ru'
					}
				]
			});
		});
	},

	rateLimit: function (req, res) {
		res.json({
			limit: req.limitTotal,
			remaining: req.limitRemaining,
			reset: req.limitReset
		});
	}
};
