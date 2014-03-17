/**
 * MainController
 *
 * @module		:: Controller
 * @description	:: GC.Main API.
 */
var net = require('net');

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
			gcmainconn.end();
			res.json(obj);
		});
	},

	economy: function (req, res) {
		res.redirect('https://greencubes.org/api.php?type=economy');
	}
};
