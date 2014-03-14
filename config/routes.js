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

	// Information about API
	'/': 'service.info',

	// Basic login stuff
	'post /login': 'auth.login',
	'get /login': 'auth.loginTpl',
	'/logout': 'auth.logout',

	// Debug stuff
	'/dev/res': 'dev.res',
	'/dev/req': 'dev.req',
	'/dev/session': 'dev.session',
	'/dev/user': 'dev.user',

	// User API
	'/users/': 'user.index',
	'/users/:user': 'user.user',
	'/user': 'user.current',

	// Server info API
	'/servers': 'server.index',
	'/servers/main': 'server.main',
	'/servers/rpg': 'server.rpg',
	'/servers/apocalyptic': 'server.apocalyptic'

};
