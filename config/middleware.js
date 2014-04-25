var Limiter = require('ratelimiter'),
	passport = require('passport'),
	oauth2orize = require('oauth2orize'),
	login = require('connect-ensure-login')

module.exports = {
	express: {
		customMiddleware: function (app) {

			app.set('json spaces', 2);

			/** Limiter **/
			app.use(function (req, res, next) {

				// Max count of requests
				var maxReqs = 1000;

				// Exceptions. Don't limit those paths
				var urlExceptions = [
					'/',
					'/rate_limit',
					'/meta'
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
							retry_in: delta,
							documentation_url: docs_url
						});
					});
				}
			});

			/** oAuth Server **/

			app.use(passport.initialize());
			app.use(passport.session());

			var server = oauth2orize.createServer();
			server.grant(oauth2orize.grant.code(function (client, redirectURI, user, ares, done) {
				var code = gcapi.generateUID(32);
				Authcode.create({
					code: code,
					clientId: client.id,
					redirectURI: redirectURI,
					userId: user.id,
					scope: client.scope
				}).done(function (err, code) {
					if (err) {
						return done(err, null);
					}

					return done(null, code.code);
				});
			}));



			// the token exchange
			server.exchange(oauth2orize.exchange.code(function (client, code, redirectURI, done) {
				Authcode.findOne({
					code: code
				}).done(function (err, code) {
					if (err || !code) {
						return done(err);
					}
					if (client.id !== code.clientId) {
						return done(null, false);
					}
					if (redirectURI !== code.redirectURI) {
						return done(null, false);
					}

					async.waterfall([
						function createOrFindToken(callback) {
							Token.findOrCreate({
								userId: code.userId,
								clientId: code.clientId
							}).done(function (err, token) {
								if (err) return callback(err);

								if (!token.token) {
									token.userId = code.userId;
									token.clientId = code.clientId;
									token.token = gcapi.generateUID(256);
									token.scope = code.scope;

									token.save(function (err) {
										if (err) return callback(err);

										callback(null, token);
									});
								} else {
									token.token = gcapi.generateUID(256);

									token.save(function (err) {
										if (err) return callback(err);

										callback(null, token);
									});
								}


							});
						},
						function removeAuthcode(token, callback) {
							if (!gcdbconn) return callback('You\'re not connected to GC MySQL DB');

							gcdbconn.query('SELECT login FROM users WHERE id = ?', [token.userId], function (err, result) {
								if (err) return callback(err);

								code.destroy(function (err) {
									if (err) return callback(err);

									if (result.length !== 0) {
										token.login = result[0].login;
										callback(null, token);
									} else {
										callback('Can\'t find login with this ID!');
									}
								});
							});
						}
					], function(err, token) {
						if (err) return done(err);

						done(null, {
							token: token.token,
							username: token.login,
							clientId: token.clientId,
							scope: token.scope
						});
					});
				});
			}));


			app.get('/oauth/authorize', function (req, res, done) {
					if (!req.query.client_id) {
						res.json(400, {
							error: "client_id is not defined",
							documentation_url: docs_url
						});
						return;
					}
					if (!req.query.redirect_uri) {
						res.json(400, {
							error: "redirect_uri is not defined",
							documentation_url: docs_url
						});
						return;
					}
					if (!req.query.response_type || req.query.response_type !== 'code') {
						res.json(400, {
							error: "Wrong response_type",
							documentation_url: docs_url
						});
						return;
					}
					if (!req.isAuthenticated() && !req.oauth2) {
						req.logout();
						Client.findOne({
							id: parseInt(req.query.client_id)
						}, function (err, cli) {
							if (err) return done(err);

							if (!cli) {
								res.json(400, {
									error: "wrong client_id",
									documentation_url: docs_url
								});
							} else if (cli.redirectURI !== req.query.redirect_uri) {
								res.json(400, {
									error: "wrong redirect_uri",
									documentation_url: docs_url
								});
							} else{
								res.render('OAuthLogin', {
									layout: 'layout',
									name: cli.name,
									description: cli.description
								});
							}
						});
						return;
					}
					done();
				},
				server.authorize(function (clientID, redirectURI, done) {
					Client.findOne({
						id: clientID
					}, function (err, cli) {

						if (err) {
							return done(err);
						}
						if (!cli) {
							return done(null, false);
						}

						return done(null, cli, cli.redirectURI);
					});
				}),
				function (req, res) {
					if (req.oauth2.client.redirectURI !== req.oauth2.req.redirectURI) {
						return res.json(400, {
							error: "wrong redirect_uri",
							documentation_url: docs_url
						});
					}

					var scopes;
					if (req.oauth2.client.scope.split(',') === req.oauth2.client.scope) {
						scopes = req.oauth2.client.scope
					} else {
						scopes = req.oauth2.client.scope.split(',')
					}

					res.render('dialog', {
						transactionID: req.oauth2.transactionID,
						user: req.user,
						cli: req.oauth2.client,
						scopes: scopes
					});
				});


			app.post('/oauth/authorize/decision',
				login.ensureLoggedIn(),
				server.decision());

			server.serializeClient(function (client, done) {
				return done(null, client.id);
			});

			server.deserializeClient(function (id, done) {
				Client.findOne(id, function (err, client) {
					if (err) {
						return done(err);
					}
					return done(null, client);
				});
			});


			app.post('/oauth/access_token',
				function (req, res, next) {
					if (!req.body.client_id) {
						res.json(400, {
							message: "client_id is not defined",
							documentation_url: docs_url
						});
					} else if (!req.body.client_secret) {
						res.json(400, {
							message: "client_secret is not defined",
							documentation_url: docs_url
						});
					} else if (!req.body.code) {
						res.json(400, {
							message: "code is not defined",
							documentation_url: docs_url
						});
					} else if (!req.body.grant_type) {
						res.json(400, {
							message: "grant_type is not defined",
							documentation_url: docs_url
						});
					} else if (!req.body.redirect_uri) {
						res.json(400, {
							message: "redirect_uri is not defined",
							documentation_url: docs_url
						});
					} else {
						next();
					}
				},
				passport.authenticate('oauth2-client-password', {
					session: false
				}),
				server.token(),
				server.errorHandler());


			app.locals({
				version: require('../package.json').version,
				scripts: ['jquery.js'],
				renderJSTags: function (all) {
					if (all !== undefined) {
						return all.map(function (scripts) {
							app.locals.scripts = ['jquery.js'];
							return '<script src="/js/' + scripts + '" type="text/javascript"></script>';
						}).join('\n ');
					} else {
						return '';
					}
				},
				styles: ['sem.css'],
				renderCSSTags: function (all) {
					app.locals.styles = ['sem.css'];
					if (all !== undefined) {
						return all.map(function (styles) {
							return '<link href="/styles/' + styles + '" type="text/css" rel="stylesheet" />';
						}).join('\n ');
					} else {
						return '';
					}
				}
			});
		}
	}
};
