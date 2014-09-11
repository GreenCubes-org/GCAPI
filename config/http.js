/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * Only applies to HTTP requests (not WebSockets)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.http.html
 */

var Limiter = require('ratelimiter');

module.exports.http = {

	/****************************************************************************
	 *                                                                           *
	 * Express middleware to use for every Sails request. To add custom          *
	 * middleware to the mix, add a function to the middleware config object and *
	 * add its key to the "order" array. The $custom key is reserved for         *
	 * backwards-compatibility with Sails v0.9.x apps that use the               *
	 * `customMiddleware` config option.                                         *
	 *                                                                           *
	 ****************************************************************************/

	middleware: {

		/***************************************************************************
		 *                                                                          *
		 * The order in which middleware should be run for HTTP request. (the Sails *
		 * router is invoked by the "router" middleware below.)                     *
		 *                                                                          *
		 ***************************************************************************/

		order: [
			'startRequestTimer',
			'cookieParser',
			'session',
			'myRequestLogger',
			'bodyParser',
			'handleBodyParserError',
			'compress',
			'limiter',
			'methodOverride',
			'poweredBy',
			'$custom',
			'router',
			'www',
			'favicon',
			'404',
			'500'
		],

		/****************************************************************************
		 *                                                                           *
		 * Example custom middleware; logs each request to the console.              *
		 *                                                                           *
		 ****************************************************************************/

		limiter: function (req, res, next) {
			// Max count of requests
			var maxReqs;

			if (req.session.passport && req.session.passport.user) {
				maxReqs = 5000;
			} else {
				maxReqs = 500;
			}

			// Exceptions. Don't limit those paths
			var urlExceptions = [
				'/',
				'/rate_limit',
				'/meta',
				'/logout',
				'/oauth/authorize',
				'/oauth/authorize/decision',
				'/oauth/access_token',
				'/dev'
			];

			if (_.contains(urlExceptions, req.path)) {
				var ipHeader = req.headers['x-real-ip'] || '127.0.0.1',
					ip = (ipHeader !== '127.0.0.1') ? ipHeader.split(',')[0] : ipHeader;

				var obj = {
					reset: null,
					count: null,
					limit: null
				};

				async.waterfall([

					function getLimits(callback) {
							redis.mget('limit:' + ip + ':reset',
								'limit:' + ip + ':count',
								'limit:' + ip + ':limit', function (err, reply) {
									if (err) return callback(err);

									if (_.contains(reply, null)) {
										obj.reset = (Date.now() + 3600000) / 1000 | 0
										obj.count = maxReqs;
										obj.limit = maxReqs;
									} else {
										obj.reset = parseInt(reply[0], 10);
										obj.count = parseInt(reply[1], 10);
										obj.limit = parseInt(reply[2], 10);
									}

									callback(null, obj);
								});
					}
				],
					function (err, obj) {
						if (err) return next(err);

						req.limitTotal = obj.limit;
						req.limitRemaining = obj.count;
						req.limitReset = obj.reset;

						res.set('X-RateLimit-Limit', obj.limit);
						res.set('X-RateLimit-Remaining', obj.count);
						res.set('X-RateLimit-Reset', obj.reset);

						next();
					});
			} else {
				var ipHeader = req.headers['x-real-ip'] || '127.0.0.1',
					ip = (ipHeader !== '127.0.0.1') ? ipHeader.split(',')[0] : ipHeader;

				var limit = new Limiter({
					id: ip,
					db: redis,
					max: maxReqs
				});

				// Limiting magic
				limit.get(function (err, lim) {
					if (err) return next(err);
					async.waterfall([
						function (callback) {
							if (lim.total !== maxReqs) {
								redis.del('limit:' + ip + ':reset');
								redis.del('limit:' + ip + ':count');
								redis.del('limit:' + ip + ':limit');

								limit.get(function (err, lim) {
									if (err) return callback(err);

									callback(null, lim);
								});
							} else {
								callback(null, lim);
							}
						}
					], function (err, lim) {
						if (err) return next(err);

						req.limitTotal = lim.total;
						req.limitRemaining = lim.remaining;
						req.limitReset = lim.reset;

						res.set('X-RateLimit-Limit', lim.total);
						res.set('X-RateLimit-Remaining', lim.remaining);
						res.set('X-RateLimit-Reset', lim.reset);

						// all good
						if (lim.remaining) return next();

						// not good
						var delta = (lim.reset * 1000) - Date.now() | 0;
						var after = lim.reset - (Date.now() / 1000) | 0;
						res.set('Retry-After', after);

						res.status(429).json({
							message: 'Rate limit exceeded, retry later',
							retry_in: delta,
							documentation_url: docs_url
						});
					});
				});
			}
		}


		/***************************************************************************
		 *                                                                          *
		 * The body parser that will handle incoming multipart HTTP requests. By    *
		 * default as of v0.10, Sails uses                                          *
		 * [skipper](http://github.com/balderdashy/skipper). See                    *
		 * http://www.senchalabs.org/connect/multipart.html for other options.      *
		 *                                                                          *
		 ***************************************************************************/

		// bodyParser: require('skipper')

	},

	/***************************************************************************
	 *                                                                          *
	 * The number of seconds to cache flat files on disk being served by        *
	 * Express static middleware (by default, these files are in `.tmp/public`) *
	 *                                                                          *
	 * The HTTP static cache is only active in a 'production' environment,      *
	 * since that's the only time Express will cache flat-files.                *
	 *                                                                          *
	 ***************************************************************************/

	cache: 31557600000
};
