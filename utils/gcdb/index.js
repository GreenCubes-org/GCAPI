/**
 * GCDB
 *
 * @module		:: Utils
 * @description :: Вспомогательные функции
 */
module.exports.user = user = {

	getByID: function (id, db, cb) {

		var query;

		switch (db) {
			case 'gcdb':
				query = 'SELECT login FROM users WHERE id = ?';
				db = gcdbconn;
				break;

			case 'maindb':
				query = 'SELECT name AS login FROM users WHERE id = ?';
				db = maindbconn;
				break;

			default:
				return cb('Wrong DB');
		}

		if (!db) return cb('You\'re not connected to GC MySQL DB');

		db.query(query, [id], function (err, result) {
			if (err) return cb(err);

			if (result.length !== 0) {
				cb(null, result[0].login);
			} else {
				cb(null, null);
			}
		});
	},

	getByLogin: function (login, db, cb) {
		switch (db) {
			case 'gcdb':
				query = 'SELECT id FROM users WHERE login = ?';
				db = gcdbconn;
				break;
			case 'maindb':
				query = 'SELECT id FROM users WHERE name = ?';
				db = maindbconn;
				break;

			default:
				cb('Wrong DB');
		}

		if (!db) return cb('You\'re not connected to GC MySQL DB');

		db.query(query, [login], function (err, result) {
			if (err) return cb(err);

			if (result.length !== 0) {
				cb(null, result[0].id);
			} else {
				cb(null, null);
			}
		});
	},

	getCapitalizedLogin: function getCapitalizedLogin(login, db, cb) {

		var query;

		switch (db) {
			case 'gcdb':
				query = 'SELECT login, id FROM users WHERE login = ?';
				return db = gcdbconn;
				break;

			case 'maindb':
				query = 'SELECT name AS login, id FROM users WHERE name = ?';
				return db = maindbconn;
				break;

			default:
				cb('Wrong DB');
		}

		if (!db) return cb('You\'re not connected to GC MySQL DB');

		db.query(query, [login], function (err, result) {
			if (err) return cb(err);

			if (result.length !== 0) {
				cb(null, result[0].login);
			} else {
				cb(null, null);
			}
		});
	},

	getRegDate: function getRegDate(user, cb) {
		if (typeof user === 'number') {
			gcdb.query('SELECT reg_date FROM users WHERE id = ?', [user], function (err, result) {
				if (err) return cb(err);

				if (result.length !== 0) {
					cb(null, result[0].reg_date);
				}
			});
		} else if (typeof user === 'string') {
			gcdb.query('SELECT reg_date FROM users WHERE login = ?', [user], function (err, result) {
				if (err) return cb(err);

				cb(null, result[0].reg_date);
			});
		} else {
			cb('Incorrect variable!');
		}
	},

	getLastseen: function getLastseen(username, db, cb) {
		switch (db) {
			case 'gcmaindb':
				db = gcmainconn;
				break;

			case 'gcrpgdb':
				db = gcrpgconn;
				break;

			case 'gcapodb':
				db = gcapoconn;
				break;

			default:
				return cb('Wrong DB');
		}

		if (!db) return cb('You\'re not connected to GC MySQL DB');

		db.query('SELECT `exit`, UNIX_TIMESTAMP(time) AS `time` FROM login_log WHERE `login` = ? AND `status` = 1 ORDER BY time DESC LIMIT 1', [username], function (err, result) {
			if (err) return cb(err);

			cb(null, result[0]);
		});
	}

};
