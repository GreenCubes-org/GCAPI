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
	// Init globals

	global.gcdb = require('../utils/gcdb');
	global.gcapi = require('../utils/gcapi');

	global.docs_url = local.docs_url || 'https://wiki.greencubes.org/API';

	global.mysql = require('mysql');
	global.cfg = require('./local.js');

	global.redis = require('redis').createClient();
	if (cfg.redis.pass) redis.auth(cfg.redis.pass);
	redis.select(cfg.redis.db.limit);
	redis.on('error', function (err) {
		console.error("[REDIS][ERR]: " + err);
	});


	global.gcdbconn = require('mysql').createPool({
		host: cfg.gcdb.host,
		database: cfg.gcdb.database,
		user: cfg.gcdb.user,
		password: cfg.gcdb.password
	});

	global.gcrpgconn = require('mysql').createPool({
		host: cfg.gcrpg.host,
		database: cfg.gcrpg.database,
		user: cfg.gcrpg.user,
		password: cfg.gcrpg.password
	});

	global.gcmainconn = require('mysql').createPool({
		host: cfg.gcmain.host,
		database: cfg.gcmain.database,
		user: cfg.gcmain.user,
		password: cfg.gcmain.password
	});

	global.gcapoconn = require('mysql').createPool({
		host: cfg.gcapo.host,
		database: cfg.gcapo.database,
		user: cfg.gcapo.user,
		password: cfg.gcapo.password
	});

	global.maindbconn = require('mysql').createPool({
		host: cfg.maindb.host,
		database: cfg.maindb.database,
		user: cfg.maindb.user,
		password: cfg.maindb.password
	});

	cb();
};
