/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */
var local = require('./local.js');

module.exports.bootstrap = function (cb) {
	sails.docs_url = local.docs_url || 'https://wiki.greencubes.org/API';

	global.mysql = require('mysql');
	global.cfg = require('./local.js');

	global.gcdbconn = require('mysql').createConnection({
		host: cfg.gcdb.host,
		database: cfg.gcdb.database,
		user: cfg.gcdb.user,
		password: cfg.gcdb.password
	});
	handleDBDisconnect(gcdbconn);

	global.gcrpgconn = require('mysql').createConnection({
		host: cfg.gcrpg.host,
		database: cfg.gcrpg.database,
		user: cfg.gcrpg.user,
		password: cfg.gcrpg.password
	});
	handleDBDisconnect(gcrpgconn);

	global.gcmainconn = require('mysql').createConnection({
		host: cfg.gcmain.host,
		database: cfg.gcmain.database,
		user: cfg.gcmain.user,
		password: cfg.gcmain.password
	});
	handleDBDisconnect(gcmainconn);

	global.gcapoconn = require('mysql').createConnection({
		host: cfg.gcapo.host,
		database: cfg.gcapo.database,
		user: cfg.gcapo.user,
		password: cfg.gcapo.password
	});
	handleDBDisconnect(gcapoconn);

	global.maindbconn = require('mysql').createConnection({
		host: cfg.maindb.host,
		database: cfg.maindb.database,
		user: cfg.maindb.user,
		password: cfg.maindb.password
	});
	handleDBDisconnect(maindbconn);

	function handleDBDisconnect(client) {
		client.on('error', function (err) {
			if (!err.fatal) return;
			if (err.code !== 'PROTOCOL_CONNECTION_LOST' || err.code !== 'PROTOCOL_ENQUEUE_AFTER_QUIT') throw err;

			// NOTE: This assignment is to a variable from an outer scope; this is extremely important
			// If this said `client =` it wouldn't do what you want. The assignment here is implicitly changed
			// to `global.mysqlClient =` in node.
			mysqlClient = mysql.createConnection(client.config);
			handleDisconnect(mysqlClient);
			mysqlClient.connect();
		});
	};

	cb();
};
