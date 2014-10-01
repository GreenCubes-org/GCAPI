/**
 * ApocalypticController
 *
 * @module		:: Controller
 * @description	:: GC.Apocalyptic API.
 */


module.exports = {

	status: function (req, res) {
		var obj = {
			server: 'Apocalyptic',
			status: null,
			online: null
		};

		async.waterfall([
			function getServerStatus(callback) {
				gcapi.srv.getStatus(cfg.srv.apocalyptic, function(online) {
					obj.status = online;

					callback(null, obj);
				});
			},
			function getPlayersCount(obj, callback) {
				gcapoconn.query('SELECT online FROM log_online ORDER BY timestamp DESC LIMIT 1', function (err, result) {
					if (err) return callback(err);

					if (result.length === 0 || !obj.status) {
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

		gcapoconn.query('SELECT login FROM login_log WHERE `exit` IS NULL ORDER BY login ASC', function (err, result) {
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
};
