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

	/* Web-API API (lolwhat) */
	'/api/info': 'api.info',

	/* User API */
	'/users/:user': 'user.info',

	/* GC.Main section */
	'/main/status': 'main.status',
	'/main/economy': 'main.economy',

	/* GC.RPG section */
	'/rpg/status': 'rpg.status',

	/* GC.Apocalyptic section */
	'/apocalyptic/status': 'apocalyptic.status'

	/*
	// Server info API
	'/servers': 'server.index',
	'/servers/main': 'server.main',
	'/servers/rpg': 'server.rpg',
	'/servers/apocalyptic': 'server.apocalyptic'
	*/

	/*
	// Debug stuff
	'/dev/res': 'dev.res',
	'/dev/req': 'dev.req',
	'/dev/session': 'dev.session',
	'/dev/user': 'dev.user',
	*/

};
