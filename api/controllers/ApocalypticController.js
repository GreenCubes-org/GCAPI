/**
 * ApocalypticController
 *
 * @module		:: Controller
 * @description	:: GC.Apocalyptic API.
 */
var mysql = require('mysql'),
	cfg = require('../../config/local.js'),
	net = require('net');

function handleDBDisconnect() {
	gcapoconn = require('mysql').createConnection({
		host: cfg.gcapo.host,
		database: cfg.gcapo.database,
		user: cfg.gcapo.user,
		password: cfg.gcapo.password
	});
	gcapoconn.connect(function (err) {
		if (err) {
			setTimeout(handleDBDisconnect, 1000);
		}
	});

	gcapoconn.on('error', function (err) {
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			handleDBDisconnect();
		} else {
			throw err;
		}
	});
};
handleDBDisconnect();

module.exports = {

	status: function (req, res) {
		var obj = {
			server: 'Apocalyptic',
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
				}).connect(cfg.srv.apocalyptic.port, cfg.srv.apocalyptic.host);
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
	}
};
