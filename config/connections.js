/**
 * Global adapter config
 *
 * The `adapters` configuration object lets you create different global "saved settings"
 * that you can mix and match in your models.  The `default` option indicates which
 * "saved setting" should be used if a model doesn't have an adapter specified.
 *
 * Keep in mind that options you define directly in your model definitions
 * will override these settings.
 *
 * For more information on adapter configuration, check out:
 * http://sailsjs.org/#documentation
 */

var local = require('./local.js');

module.exports.connections = {

  // If you leave the adapter config unspecified
  // in a model definition, 'default' will be used.
  'default': 'mysql',

  // MySQL is the world's most popular relational database.
  // Learn more: http://en.wikipedia.org/wiki/MySQL
  mysql: {
	adapter: 'sails-mysql',
	host: local.appdb.host,
	user: local.appdb.user,
	password: local.appdb.password,
	database: local.appdb.database
  }
};
