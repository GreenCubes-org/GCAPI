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
	
	/* OAuth client login */
	'post /login': 'auth.login',
	'get /login': 'auth.loginTpl',
	'/logout': 'auth.logout',

	/* OAuth applications admin API */
	'get /oauth/apps': 'oauth.listApps',
	'post /oauth/apps/new': 'oauth.registerApp',
	'get /oauth/apps/:id': 'oauth.getApp',
	'put /oauth/apps/:id': 'oauth.editApp',
	'delete /oauth/apps/:id': 'oauth.deleteApp',

	/* Misc API (lolwhat) */
	'/meta': 'misc.info',
	'/rate_limit': 'misc.rateLimit',

	/* User API */
	'/user': 'user.currentUserInfo',
	'/user/regions': 'user.regions_list',
	'/users/:user': 'user.userInfo',

	/* GC.Main section */
	'/main/status': 'main.status',
	'/main/online': 'main.online',
	'/main/economy': 'main.economy',
	'/main/named_colors': 'main.namedColorsJSON',
	'/main/named_colors/html': 'main.namedColorsHTML',
	'/main/items': 'main.items',
	'/main/regions/:region': 'main.region_info',

	/* GC.RPG section */
	'/rpg/status': 'rpg.status',
	'/rpg/online': 'rpg.online',

	/* GC.Apocalyptic section */
	'/apocalyptic/status': 'apocalyptic.status',
	'/apocalyptic/online': 'apocalyptic.online'

};
