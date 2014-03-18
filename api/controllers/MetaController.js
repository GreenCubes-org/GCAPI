/**
 * ApiController
 *
 * @module		:: Controller
 * @description	:: Web-API API.
 */
var version = require('../../package.json').version,
	git = require('git-rev');

module.exports = {

	info: function (req, res) {
		obj = {
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
	}
};
