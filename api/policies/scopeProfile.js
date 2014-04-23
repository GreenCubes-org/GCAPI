/**
* oAuth 2 token policy
**/
var passport = require('passport');

module.exports = function(req,res,next) {

	if (req.user) {
		return next();
	}

	if (!req.query.access_token) {
		return res.status(403).json({
			message: 'Forbidden. Need authorization',
			documentation_url: docs_url
		});
	}
	
	Token.find({
		token: req.query.access_token
	}).done(function(err, token) {
		if (!token.length || !token[0].scope) {
			return res.status(403).json({
				message: 'Forbidden. Need authorization',
				documentation_url: docs_url
			});
		}

		passport.authenticate(
			'bearer',
			function(err, user, info)
			{
				if ((err) || (!user))
				{
					return res.status(403).json({
						message: 'Forbidden. Need authorization',
						documentation_url: docs_url
					});
				}
				
				var scopes;
				if (token[0].scope === null) {
					return res.status(403).json({
						message: 'Forbidden. Access token don\'t have access to this scope',
						scope: 'profile',
						documentation_url: docs_url
					});
				} else if (token[0].scope.split(',') === token[0].scope) {
					scopes = [token[0].scope]
				} else  {
					scopes = token[0].scope.split(',')
				}
				if (!(_.contains(scopes, 'profile') || scopes === '*')) {
					return res.status(403).json({
						message: 'Forbidden. Token don\'t have access to this scope',
						scope: 'profile',
						documentation_url: docs_url
					});
				}
				
				delete req.query.access_token;
				req.user = user;
				
				req.oauth2 = {
					scopes: scopes,
					user: user.login
				};

				return next();
			}
		)(req, res);
	});
};
