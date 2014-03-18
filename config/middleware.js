var Limiter = require('ratelimiter');

module.exports = {
	// Init custom express middleware
	express: {
		customMiddleware: function (app) {

			app.use(function(req, res, next){
				limit = new Limiter({
					id: req.ip,
					db: redis,
					max: 1000
				});

				// Limiting magic
				limit.get(function (err, limit) {
					if (err) return next(err);

					req.limitTotal = limit.total;
					req.limitRemaining = limit.remaining;
					req.limitReset = limit.reset;
					res.set('X-RateLimit-Limit', limit.total);
					res.set('X-RateLimit-Remaining', limit.remaining);
					res.set('X-RateLimit-Reset', limit.reset);

					// all good
					if (limit.remaining) return next();

					// not good
					var delta = (limit.reset * 1000) - Date.now() | 0;
					var after = limit.reset - (Date.now() / 1000) | 0;
					res.set('Retry-After', after);
					res.status(429).json({
						message: 'Rate limit exceeded, retry later',
						retry_in: ms(delta, {long: true})
					});
				});
			});
		}
	}
};
