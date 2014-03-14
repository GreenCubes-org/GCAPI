/**
 * AuthController
 *
 * @module		:: Controller
 * @description	:: Authorization controllers.
 */

var passport = require('passport'),
	login = require('connect-ensure-login');

module.exports = {

	logintpl: function (req, res) {
		if (req.isAuthenticated()) return res.redirect('/');

		res.view('login');
	},

	login: function (req, res) {
		passport.authenticate('local', function (err, user, info) {
			if ((err) || (!user)) {
				if (info.message === 'Missing credentials') info.message = 'Введите логин/пароль';
				return res.json({
					error: info
				});
			}
			req.logIn(user, function (err) {
				if (err) throw err;

				console.log(req.session.returnTo);
				if (req.session.returnTo) res.redirect(req.session.returnTo)
					else res.redirect('/');
			});
		})(req, res);
	},

	logout: function (req, res) {
		if (req.user) {
			req.logout();
			res.json({
				code: '200',
				message: 'Success'
			});
		} else {
			res.json({
				code: '203',
				message: 'You\'re not logged on'
			});
		}
	},

};
