/**
 * UserController
 *
 * @module		:: Controller
 * @description	:: Contains global users API.
 */

//FIXME: Поменять на глобальную переменную
var mysql = require('mysql'),
	cfg = require('../../config/local.js');

function handleDBDisconnect() {
	gcdbconn = require('mysql').createConnection({
		host: cfg.gcdb.host,
		database: cfg.gcdb.database,
		user: cfg.gcdb.user,
		password: cfg.gcdb.password
	});
	gcdbconn.connect(function (err) {
		if (err) {
			gcdbconn.end();
			setTimeout(handleDBDisconnect, 1000);
		}
	});

	gcdbconn.on('error', function (err) {
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			gcdbconn.end();
			handleDBDisconnect();
		} else {
			gcdbconn.end();
			throw err;
		}
	});

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

	gcmainconn = require('mysql').createConnection({
		host: cfg.gcmain.host,
		database: cfg.gcmain.database,
		user: cfg.gcmain.user,
		password: cfg.gcmain.password
	});
	gcmainconn.connect(function (err) {
		if (err) {
			gcmainconn.end();
			setTimeout(handleDBDisconnect, 1000);
		}
	});

	gcmainconn.on('error', function (err) {
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			gcmainconn.end();
			handleDBDisconnect();
		} else {
			gcmainconn.end();
			throw err;
		}
	});

	gcapoconn = require('mysql').createConnection({
		host: cfg.gcapo.host,
		database: cfg.gcapo.database,
		user: cfg.gcapo.user,
		password: cfg.gcapo.password
	});
	gcapoconn.connect(function (err) {
		if (err) {
			gcapoconn.end();
			setTimeout(handleDBDisconnect, 1000);
		}
	});

	gcapoconn.on('error', function (err) {
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			gcapoconn.end();
			handleDBDisconnect();
		} else {
			gcapoconn.end();
			throw err;
		}
	});

	maindbconn = require('mysql').createConnection({
		host: cfg.maindb.host,
		database: cfg.maindb.database,
		user: cfg.maindb.user,
		password: cfg.maindb.password
	});
	maindbconn.connect(function (err) {
		if (err) {
			maindbconn.end();
			setTimeout(handleDBDisconnect, 1000);
		}
	});

	maindbconn.on('error', function (err) {
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			maindbconn.end();
			handleDBDisconnect();
		} else {
			maindbconn.end();
			throw err;
		}
	});
};
handleDBDisconnect();

module.exports = {

	current: function (req, res) {
		if (!req.user) {
			return res.json({
				message: 'You\'re not logged on',
				documentation_url: sails.docs_url
			});
		}

		var username =  req.user.username.replace(/[^a-zA-Z0-9_-]/g, '');
		var obj = {
			username: username,
			lastseen: {
				main: null,
				rpg: null,
				apocalyptic: null
			},
			reg_date: null,
			prefix: null,
			nick_color: null,
			skin_url: 'http://greenusercontent.net/mc/skins/' + username + '.png'
		};

		async.waterfall([
			function findLastseenMain(callback) {
				gcmainconn.query('SELECT time FROM login_log WHERE login = ? limit 1', [username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						callback(null, obj);
					} else {
						obj.lastseen.main = result[0].time;
						callback(null, obj);
					}
				});
			},
			function findLastseenRpg(obj, callback) {
				gcrpgconn.query('SELECT time FROM login_log WHERE login = ? limit 1', [username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						callback(null, obj);
					} else {
						obj.lastseen.rpg = result[0].time;
						callback(null, obj);
					}
				});
			},
			function findLastseenApo(obj, callback) {
				gcapoconn.query('SELECT time FROM login_log WHERE login = ? limit 1', [username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						callback(null, obj);
					} else {
						obj.lastseen.apocalyptic = result[0].time;
						callback(null, obj);
					}
				});
			},
			function findRegDate(obj, callback) {
				gcdbconn.query('SELECT reg_date FROM users WHERE login = ?', [username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						callback(null, obj);
					} else {
						obj.reg_date = result[0].reg_date;
						callback(null, obj);
					}
				});
			},
			function findPrefixNickColor(obj, callback) {
				maindbconn.query('SELECT prefix, color FROM users WHERE name = ?', [username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						callback(null, obj);
					} else {
						obj.prefix = result[0].prefix;
						obj.nick_color = result[0].color;

						callback(null, obj);
					}
				});
			}
		], function (err, obj) {
			if (err) {
				if (err.show) {
					res.status(404).json({
						message: err.message,
						documentation_url: sails.docs_url
					});
				} else {
					throw err;
				}
			}
			res.json(obj);
		});


	},

	user: function (req, res) {
		var username = req.params.user.replace(/[^a-zA-Z0-9_-]/g, '');
		var obj = {
			username: username,
			lastseen: {
				main: null,
				rpg: null,
				apocalyptic: null
			},
			reg_date: null,
			prefix: null,
			nick_color: null,
			skin_url: 'http://greenusercontent.net/mc/skins/' + username + '.png'
		};

		async.waterfall([
			function userExists(callback) {
				gcdbconn.query('SELECT id FROM users WHERE login = ?', [username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						callback({
							show: true,
							message: 'User not exists'
						});
					} else {
						callback(null);
					}
				});
			},
			function findLastseenMain(callback) {
				gcmainconn.query('SELECT UNIX_TIMESTAMP(time) AS time FROM login_log WHERE login = ? limit 1', [username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						callback(null, obj);
					} else {
						obj.lastseen.main = result[0].time;
						callback(null, obj);
					}
				});
			},
			function findLastseenRpg(obj, callback) {
				gcrpgconn.query('SELECT UNIX_TIMESTAMP(time) AS time FROM login_log WHERE login = ? limit 1', [username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						callback(null, obj);
					} else {
						obj.lastseen.rpg = result[0].time;
						callback(null, obj);
					}
				});
			},
			function findLastseenApo(obj, callback) {
				gcapoconn.query('SELECT UNIX_TIMESTAMP(time) AS time FROM login_log WHERE login = ? limit 1', [username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						callback(null, obj);
					} else {
						obj.lastseen.apocalyptic = result[0].time;
						callback(null, obj);
					}
				});
			},
			function findRegDate(obj, callback) {
				gcdbconn.query('SELECT UNIX_TIMESTAMP(reg_date) AS reg_date FROM users WHERE login = ?', [username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						callback(null, obj);
					} else {
						obj.reg_date = result[0].reg_date;
						callback(null, obj);
					}
				});
			},
			function findPrefixNickColor(obj, callback) {
				maindbconn.query('SELECT prefix, color FROM users WHERE name = ?', [username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						callback(null, obj);
					} else {
						obj.prefix = result[0].prefix;
						obj.nick_color = result[0].color;

						callback(null, obj);
					}
				});
			}
		], function (err, obj) {
			if (err) throw err;

			res.json(obj);
		});


	}

};
