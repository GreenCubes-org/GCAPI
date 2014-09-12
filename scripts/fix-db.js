/* _waterline_dummy02492 fix */
console.log('[FIX-DB] Start script');

var async = require('../node_modules/sails/node_modules/async'),
	mysql = require('mysql'),
	cfg = cfg = require('../config/local');

console.log('[FIX-DB] Start connection to DB');
var appdbconn = require('mysql').createConnection({
		host: cfg.appdb.host,
		database: cfg.appdb.database,
		user: cfg.appdb.user,
		password: cfg.appdb.password
	});

console.log('[FIX-DB] Processing commands:');

async.waterfall([
	function a(callback) {
		appdbconn.query('ALTER TABLE `authcode` DROP `_waterline_dummy02492`; ', function (err, result) {
			if (err) {
				if (err.errno === 1091) {
					console.log('[FIX-DB] DROP _waterline_dummy02492 IN authcode - ALREADY REMOVED');
					return callback(null)
				} else {
					console.error('[FIX-DB] ERROR. I\'M SO SORRY.');
					return callback(err);
				}
			}

			console.log('[FIX-DB] DROP _waterline_dummy02492 IN authcode - SUCCESS');
			callback(null);
		});
	},
	function b(callback) {
		appdbconn.query('ALTER TABLE `client` DROP `_waterline_dummy02492`; ', function (err, result) {
			if (err) {
				if (err.errno === 1091) {
					console.log('[FIX-DB] DROP _waterline_dummy02492 IN client - ALREADY REMOVED');
					return callback(null)
				} else if (err) {
					console.error('[FIX-DB] ERROR. I\'M SO SORRY.');
					return callback(err);
				}
			}

			console.log('[FIX-DB] DROP _waterline_dummy02492 IN client - SUCCESS');
			callback(null);
		});
	},
	function c(callback) {
		appdbconn.query('ALTER TABLE `token` DROP `_waterline_dummy02492`; ', function (err, result) {
			if (err) {
				if (err.errno === 1091) {
					console.log('[FIX-DB] DROP _waterline_dummy02492 IN token - ALREADY REMOVED');
					return callback(null)
				} else if (err) {
					console.error('[FIX-DB] ERROR. I\'M SO SORRY.');
					return callback(err);
				}
			}

			console.log('[FIX-DB] DROP _waterline_dummy02492 IN token - SUCCESS');
			callback(null);
		});
	}
], function (err) {
	if (err) throw err;

	console.log('[FIX-DB] DONE. GOODBYE.');
	process.exit(0);
})
