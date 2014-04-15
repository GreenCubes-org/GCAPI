/**
 * UserController
 *
 * @module		:: Controller
 * @description	:: Contains global users API.
 */

module.exports = {
	
	currentUserInfo: function (req, res) {
		if (!req.user) {
			return res.json({
				message: 'You\'re not logged on',
				documentation_url: docs_url
			});
		}

		var username =  req.user.login;
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
						documentation_url: docs_url
					});
				} else {
					throw err;
				}
			}
			res.json(obj);
		});


	},

	userInfo: function (req, res) {
		username = req.params.user.replace(/[^a-zA-Z0-9_-]/g, '');
		obj = {
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
			if (err) {
				if (err.show) {
					return res.json({
						message: err.message,
						documentation_url: docs_url
					});
				}

				throw err;
			}

			res.json(obj);
		});


	}

};
