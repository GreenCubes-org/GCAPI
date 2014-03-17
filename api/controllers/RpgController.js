/**
 * RpgController
 *
 * @module		:: Controller
 * @description	:: GC.RPG API.
 */
var mysql = require('mysql'),
	cfg = require('../../config/local.js'),
	net = require('net');

function handleDBDisconnect() {
	gcrpgconn = require('mysql').createConnection({
		host: cfg.gcrpg.host,
		database: cfg.gcrpg.database,
		user: cfg.gcrpg.user,
		password: cfg.gcrpg.password
	});
	gcrpgconn.connect(function (err) {
		if (err) {
			gcrpgconn.end();
			setTimeout(handleDBDisconnect, 1000);
		}
	});

	gcrpgconn.on('error', function (err) {
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			gcrpgconn.end();
			handleDBDisconnect();
		} else {
			gcrpgconn.end();
			throw err;
		}
	});
};
handleDBDisconnect();

module.exports = {

	status: function (req, res) {
		var obj = {
			server: 'RPG',
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
				}).connect(cfg.srv.rpg.port, cfg.srv.rpg.host);
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
			gcrpgconn.end();
			res.json(obj);
		});
	}
};
