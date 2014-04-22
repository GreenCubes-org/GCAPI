/**
 * MainController
 *
 * @module		:: Controller
 * @description	:: GC.Main API.
 */

var moment = require('moment');
moment.lang('ru');

module.exports = {

	status: function (req, res) {
		var obj = {
			server: 'Main',
			status: null,
			online: null
		};

		async.waterfall([
			function getServerStatus(callback) {
				gcapi.srv.getStatus(cfg.srv.main, function(online) {
					obj.status = online;

					callback(null, obj);
				});
			},
			function getPlayersCount(obj, callback) {
				gcmainconn.query('SELECT online FROM log_online ORDER BY timestamp DESC LIMIT 1', function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						callback(null, obj);
					} else {
						obj.online = result[0].online;
						callback(null, obj);
					}
				});
			}
		], function (err, obj) {
			if (err) {
				if (!err.show) throw err;
			}

			res.json(obj);
		});
	},

	online: function (req, res) {
		var obj = [];

		gcmainconn.query('SELECT login FROM login_log WHERE `exit` IS NULL ORDER BY login ASC', function (err, result) {
			if (err) throw err;

			if (result.length === 0) {
				res.json(obj);
			} else {
				async.each(result, function (element, callback) {
					if (!(_.contains(cfg.userStatusException, element.login))) {
						obj.push(element.login);
					}

					callback(null);
				}, function () {
					res.json(obj);
				});

			}
		});
	},

	economy: function (req, res) {
		res.redirect('https://greencubes.org/api.php?type=economy');
	},

	namedColorsJSON: function (req, res) {
		async.waterfall([
			function getNamedColors(callback) {
				var query = 'SELECT name, localizedName, h, s, pioneer, UNIX_TIMESTAMP(opened) AS opened, secondPioneer, UNIX_TIMESTAMP(repeated) AS repeated FROM `named_colors`';

				gcmainconn.query(query, function (err, result) {
					if (err) return callback(err);

					callback(null, result);
				});
			},
			function setLogins(obj, callback) {
				async.map(obj, function(element, callback) {
					if (element.pioneer === -1) {
						element.pioneer = "System color";
						element.secondPioneer = "System color";

						return callback(null, element);
					}

					gcdb.user.getByID(element.pioneer, 'maindb', function(err, result) {
						if (err) return callback(err);

						element.pioneer = result;

						gcdb.user.getByID(element.secondPioneer, 'maindb', function(err, result) {
							if (err) return callback(err);

							element.secondPioneer = result;

							callback(null, element);
						});
					});
				}, function(err, obj) {
					if (err) return callback(err);

					callback(null, obj);
				});
			}
		], function (err, obj) {
			if (err) throw err;

			res.json(obj);
		});
	},

	namedColorsHTML: function (req, res) {
		async.waterfall([
			function getNamedColors(callback) {
				var query = 'SELECT name, localizedName, h, s, pioneer, opened, secondPioneer, repeated FROM `named_colors`';

				gcmainconn.query(query, function (err, result) {
					if (err) return callback(err);

					callback(null, result);
				});
			},
			function setLogins(obj, callback) {
				async.map(obj, function(element, callback) {
					if (element.pioneer === -1) {
						element.pioneer = "System color";
						element.secondPioneer = "System color";

						return callback(null, element);
					}

					gcdb.user.getByID(element.pioneer, 'maindb', function(err, result) {
						if (err) return callback(err);

						element.pioneer = result;

						gcdb.user.getByID(element.secondPioneer, 'maindb', function(err, result) {
							if (err) return callback(err);

							element.secondPioneer = result;
							callback(null, element);
						});
					});
				}, function(err, obj) {
					if (err) return callback(err);

					callback(null, obj);
				});
			}
		], function (err, obj) {
			if (err) throw err;

			res.view('namedColors', {
				obj: obj,
				moment: moment
			});
		});
	},

	items: function (req, res) {
		async.waterfall([
			function getItems(callback) {
				var query = 'SELECT `id`, `data`, `name`, `image` AS `image_url` FROM `items`';

				maindbconn.query(query, function (err, result) {
					if (err) return callback(err);

					callback(null, result);
				});
			},
			function serializeItems(obj, callback) {
				async.map(obj, function (element, callback) {
					element.image_url = 'https://greencubes.org/img/items/' + element.image_url;

					callback(null, element);
				}, function (err, result) {

					callback(null, result);
				});
			}
		], function (err, obj) {
			if (err) throw err;

			res.json(obj);
		});
	}
};
