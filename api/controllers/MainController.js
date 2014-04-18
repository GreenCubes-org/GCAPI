/**
 * MainController
 *
 * @module		:: Controller
 * @description	:: GC.Main API.
 */
var net = require('net');


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
				var sock = new net.Socket();
				sock.setTimeout(500);
				sock.on('connect', function() {
					sock.destroy();

					obj.status = true;

					callback(null, obj);
				}).on('error', function(e) {
					obj.status = false;

					callback({ show: true }, obj);
				}).connect(cfg.srv.main.port, cfg.srv.main.host);
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

	economy: function (req, res) {
		res.redirect('https://greencubes.org/api.php?type=economy');
	},

	namedColorsJSON: function (req, res) {
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

					gcdb.user.getByID(element.pioneer, function(err, result) {
						if (err) return callback(err);

						element.pioneer = result;

						gcdb.user.getByID(element.secondPioneer, function(err, result) {
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

					gcdb.user.getByID(element.pioneer, function(err, result) {
						if (err) return callback(err);

						element.pioneer = result;

						gcdb.user.getByID(element.secondPioneer, function(err, result) {
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
	}
};
