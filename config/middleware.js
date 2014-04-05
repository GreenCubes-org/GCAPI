var Limiter = require('ratelimiter'),
	passport = require('passport'),
	oauth2orize = require('oauth2orize'),
	login = require('connect-ensure-login'),
	utils = require('../utils.js');

module.exports = {
	express: {
		customMiddleware: function (app) {
			
			/** Limiter **/
			
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
						retry_in: ms(delta, {long: true}),
						documentation_url: docs_url
					});
				});
			});

			/** oAuth Server **/

			app.use(passport.initialize());
			app.use(passport.session());

			var server = oauth2orize.createServer();
			server.grant(oauth2orize.grant.code(function (client, redirectURI, user, ares, done) {
				var code = utils.uid(32);
				Authcode.create({
					code: code,
					clientId: client.id,
					redirectURI: redirectURI,
					userId: user.id,
					scope: ares.scope
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

					var token = utils.uid(256);
					Token.create({
						token: token,
						userId: code.userId,
						clientId: code.clientId,
						scope: code.scope
					}).done(function (err, token) {
						if (err) {
							return done(err);
						}
						if (!gcdbconn) return cb('You\'re not connected to GC MySQL DB');

						gcdbconn.query('SELECT login FROM users WHERE id = ?', [token.userId], function (err, result) {
							if (err) return cb(err);

							code.destroy(function(err) {
								if (err) return done(err);
								
								if (result.length !== 0) {
									done(null, {
										token: token.token,
										username: result[0].login,
										clientId: token.clientId,
										scope: token.scope
									});
								} else {
									done('Can\'t find login with this ID!');
								}
							});
						});
					});
				});
			}));


			app.get('/oauth/authorize', function (req, res, done) {
				if (!req.query.client_id) {
					res.json({
						error: "client_id is not defined",
						documentation_url: sails.docs_url
					});
					return;
				}
				if (!req.query.redirect_uri) {
					res.json({
						error: "redirect_uri is not defined",
						documentation_url: sails.docs_url
					});
					return;
				}
				if (!req.query.response_type || req.query.response_type !== 'code') {
					res.json({
						error: "wrong response_type",
						documentation_url: sails.docs_url
					});
					return;
				}
				if (!req.isAuthenticated()) {
					Client.findOne({
						id: parseInt(req.query.client_id)
					}, function (err, cli) {
						if (err) return done(err);

						res.render('OAuthLogin', {
							layout: 'layout',
							name: cli.name,
							description: cli.text
						});
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
					if (cli.redirectURI != redirectURI) {
						return done(null, false);
					}
					return done(null, cli, cli.redirectURI);
				});
			}),
			function (req, res) {
				res.render('dialog', {
					transactionID: req.oauth2.transactionID,
					user: req.user,
					cli: req.oauth2.client
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


			app.post('/oauth/token',
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
