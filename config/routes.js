/**
 * Routes
 *
 * Sails uses a number of different strategies to route requests.
 * Here they are top-to-bottom, in order of precedence.
 *
 * For more information on routes, check out:
 * http://sailsjs.org/#documentation
 */


module.exports.routes = {

	/* Index */
	'/': 'home.index',

	/* Meta API (lolwhat) */
	'/meta': 'misc.info',
	'/rate_limit': 'misc.rateLimit',

	/* User API */
	'/users/:user': 'user.info',

	/* GC.Main section */
	'/main/status': 'main.status',
	'/main/economy': 'main.economy',

	/* GC.RPG section */
	'/rpg/status': 'rpg.status',

	/* GC.Apocalyptic section */
	'/apocalyptic/status': 'apocalyptic.status'

};
