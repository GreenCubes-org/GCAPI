//
/** Passport stuff **/
//
var passport = require('passport'),
	BearerStrategy = require('passport-http-bearer').Strategy,
	BasicStrategy = require('passport-http').BasicStrategy,
	LocalStrategy = require('passport-local').Strategy,
	ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
	mysql = require('mysql'),
	crypto = require('crypto');

//FIXME: Поменять на глобальную переменную
var cfg = require('./local');

function handleGCDBDisconnect() {
	gcdbconn = require('mysql').createConnection({
		host: cfg.gcdb.host,
		database: cfg.gcdb.database,
		user: cfg.gcdb.user,
		password: cfg.gcdb.password
	});
	gcdbconn.connect(function (err) {
		if (err) {
			setTimeout(handleGCDBDisconnect, 1000);
		}
	});

	gcdbconn.on('error', function (err) {
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			handleGCDBDisconnect();
		} else {
			throw err;
		}
	});
}

handleGCDBDisconnect();

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	gcdbconn.query('SELECT login, password FROM users WHERE id = ?', [id], function (err, result, fields) {
		if (err) return done(err);

		done(null, {
			id: id,
			username: result[0].login,
			password: result[0].password
		});
	});
});

/* GC.DB Auth */
passport.use(new LocalStrategy(function (username, password, done) {
	process.nextTick(
	function () {
		username = username.replace(/[^a-zA-Z0-9_-]/g, '');
		gcdbconn.query('SELECT id, password, activation_code FROM users WHERE login = ?', [username], function (err, result) {
			// database error
			if (err) {
				return done(err, false, {
					message: 'Ошибка базы данных'
				});
				// username not found
			} else if (result.length === 0) {
				return done(null, false, {
					message: 'Неверный логин/пароль'
				});
				// check password
			} else if (result[0].activation_code === undefined) {
				return done(null, false, {
					message: 'Аккаунт не активирован'
				});
			} else {
				var passwd = result[0].password.split('$');
				var hash;
				if (passwd.length == 1) {
					hash = crypto.createHash('md5')
						.update(password)
						.digest('hex');
				} else {
					hash = crypto.createHash('sha1')
						.update(passwd[1] + password)
						.digest('hex');
				}
				// if md5 passwords match
				if (passwd.length === 1 && passwd[0] === hash) {
					var user = {
						id: result[0].id,
						username: username,
						password: hash
					};
					// if sha1 passwords match
				} else if (passwd.length !== 1 && passwd[2] === hash) {
					var user = {
						id: result[0].id,
						username: username,
						password: hash
					};

				} else {
					return done(null, false, {
						message: 'Неверный пароль'
					});
				}

				done(null, user);
			}
		});
	});
}));


/**
 * BasicStrategy & ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered OAuth clients.  They are
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens.  The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate.  Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the `Authorization` header).  While this approach is not recommended by
 * the specification, in practice it is quite common.
 */
passport.use(new BasicStrategy(

function (username, password, done) {
    User.findOne({
        email: username
    }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false);
        }
        if (!user.password != password) {
            return done(null, false);
        }
        return done(null, user);
    });
}));

passport.use(new ClientPasswordStrategy(

function (clientId, clientSecret, done) {
    Client.findOne({
        id: clientId
    }, function (err, client) {
        if (err) {
            return done(err);
        }
        if (!client) {
            return done(null, false);
        }
        if (client.clientSecret != clientSecret) {
            return done(null, false);
        }
        return done(null, client);
    });
}));

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate users based on an access token (aka a
 * bearer token).  The user must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
passport.use(new BearerStrategy(
  function(accessToken, done) {
    Token.findOne({token:accessToken}, function(err, token) {
      if (err) { return done(err); }
      if (!token) { return done(null, false); }
      var info = {scope: '*'}
      User.findOne({
          id: token.userId
      }).done(
      function (err, user) {
        User.findOne({
            id: token.userId
        },done(err,user,info));
      });
    });
  }
));
