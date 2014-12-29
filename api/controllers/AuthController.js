/**
 * AuthController
 *
 * @module		:: Controller
 * @description	:: Authorization controllers.
 */

var passport = require('passport');

module.exports = {

	logintpl: function (req, res) {
		if (req.isAuthenticated()) return res.redirect('/');

		res.setHeader("X-Frame-Options", "DENY");

		res.view('login');
	},

	login: function (req, res) {
		passport.authenticate('local', function (err, user, info) {
			if ((err) || (!user)) {
				if (info.message === 'Missing credentials') info.message = 'Введите логин/пароль';
				return res.json({
					message: info,
					documentation_url: docs_url
				});
			}
			req.logIn(user, function (err) {
				if (err) return res.serverError(err);

				res.json({
					message: 'Success',
					documentation_url: docs_url
				});
			});
		})(req, res);
	},

	logout: function (req, res) {
		if (req.user) {
			req.logout();
			res.json({
				message: 'Success',
				documentation_url: docs_url
			});
		} else {
			res.json({
				message: 'You\'re not logged on',
				documentation_url: docs_url
			});
		}
	},

	deny: function (req, res) {
		if (!req.query.client_id) {
			res.json({
				message: "client_id is not defined",
				documentation_url: docs_url
			});
			return;
		}
		if (!req.query.redirect_uri) {
			res.json({
				message: "redirect_uri is not defined",
				documentation_url: docs_url
			});
			return;
		}
		if (!req.query.response_type || req.query.response_type !== 'code') {
			res.json({
				message: "Wrong response_type",
				documentation_url: docs_url
			});
			return;
		}
		Client.findOne({
			id: parseInt(req.query.client_id),
			redirectURI: req.query.redirect_uri
		}, function (err, cli) {
			if (err) return done(err);

			res.redirect(failRedirectURI);
		});
	}

};
