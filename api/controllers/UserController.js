/**
 * UserController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

//FIXME: Поменять на глобальную переменную
var mysql = require('mysql'),
	cfg = require('../../config/local.js');

function handleGCDBDisconnect() {
	gcdbconn = require('mysql').createConnection({
		host: cfg.gcdb.host,
		database: cfg.gcdb.database,
		user: cfg.gcdb.user,
		password: cfg.gcdb.password
	});
	gcdbconn.connect(function (err) {
		if (err) {
			setTimeout(handleGCDBDisconnect, 1000);
		}
	});

	gcdbconn.on('error', function (err) {
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			handleGCDBDisconnect();
		} else {
			throw err;
		}
	});
};
handleGCDBDisconnect();

function handleMainDBDisconnect() {
	maindbconn = require('mysql').createConnection({
		host: cfg.maindb.host,
		database: cfg.maindb.database,
		user: cfg.maindb.user,
		password: cfg.maindb.password
	});
	maindbconn.connect(function (err) {
		if (err) {
			setTimeout(handleMainDBDisconnect, 1000);
		}
	});

	maindbconn.on('error', function (err) {
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			handleMainDBDisconnect();
		} else {
			throw err;
		}
	});
};
handleMainDBDisconnect();

module.exports = {

	index: function (req, res) {

	},

	current: function (req, res) {
		var username =  req.user.username;
		var obj = {
			username: req.user.username,
			id: req.user.id,
			lastseen: null,
			reg_date: null,
			prefix: null,
			color: null,
			skin_url: 'http://greenusercontent.net/mc/skins/' + username + '.png'
		};

		async.waterfall([
			function findRegDate(callback) {
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
						obj.color = result[0].color;

						callback(null, obj);
					}
				});
			}
		], function (err, obj) {
			if (err) throw err;

			res.json(obj);
		});


	},

	user: function (req, res) {
		var username = req.params.user.replace(/[^a-zA-Z0-9_-]/g, '');
		var obj = {
			username: username,
			id: null,
			lastseen: null,
			reg_date: null,
			prefix: null,
			nick_color: null,
			skin_url: 'http://greenusercontent.net/mc/skins/' + username + '.png'
		};

		async.waterfall([
			function findId(callback) {
				gcdbconn.query('SELECT id FROM users WHERE login = ?', [username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						callback(null, obj);
					} else {
						obj.id = result[0].id;
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
						obj.color = result[0].color;

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
