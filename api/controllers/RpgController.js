/**
 * RpgController
 *
 * @module		:: Controller
 * @description	:: GC.RPG API.
 */

module.exports = {

	status: function (req, res) {
		var obj = {
			server: 'RPG',
			status: null,
			online: null
		};

		async.waterfall([
			function getServerStatus(callback) {
				gcapi.srv.getStatus(cfg.srv.rpg, function(online) {
					obj.status = online;

					callback(null, obj);
				});
			},
			function getPlayersCount(obj, callback) {
				gcrpgconn.query('SELECT online FROM log_online ORDER BY timestamp DESC LIMIT 1', function (err, result) {
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
	}
};
