var net = require('net'),
	passport = require('passport')

module.exports.getRightById = getRightById = function getRightById(id) {
	switch (id) {
		case 0:
			return 'full';

		case 1:
			return 'grant';

		case 2:
			return 'build';

		case 3:
			return 'grant-child';

		case 4:
			return 'build-child';

		case 5:
			return 'flow';

		case 6:
			return 'fire';

		case 7:
			return 'grant-grant-child';

		case 8:
			return 'grant-grant';

		case 9:
			return 'create-child';

		case 10:
			return 'delete';

		case 11:
			return 'place';

		case 12:
			return 'break';

		default:
			return;
	};
};

module.exports.srv = srv = {

	getStatus: function getStatus(srvCfg, cb) {
		var sock = new net.Socket();

		sock.setTimeout(500);
		sock.on('connect', function() {
			sock.destroy();

			cb(true);
		}).on('error', function(e) {
			cb(false);
		}).connect(srvCfg.port, srvCfg.host);
	}

};

/**
 * Return a unique identifier with the given `len`.
 *
 *     gct.generateUID(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */
module.exports.generateUID = function(len) {
  var buf = []
    , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./'
    , charlen = chars.length;

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};

module.exports.scopePolice = function(scope,req,res,next) {

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
	}).exec(function(err, token) {
		if (!token.length || !token[0].scope) {
			return res.status(403).json({
				message: 'Forbidden. Need authorization',
				documentation_url: docs_url
			});
		}

		passport.authenticate(
			'bearer',
			{ session: false },
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
						scope: scope,
						documentation_url: docs_url
					});
				} else if (token[0].scope.split(',') === token[0].scope) {
					scopes = [token[0].scope]
				} else  {
					scopes = token[0].scope.split(',')
				}

				if (!(_.contains(scopes, scope) || scopes === '*')) {
					return res.status(403).json({
						message: 'Forbidden. Token don\'t have access to this scope',
						scope: scope,
						documentation_url: docs_url
					});
				}

				delete req.query.access_token;
				req.user = user;

				req.oauth2 = {
					scopes: scopes,
					user: user.login
				};

				next();
			}
		)(req, res);
	});
};

/**
 * Return a random int, used by `gct.generateUID()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
