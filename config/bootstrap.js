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

	cb();
};
