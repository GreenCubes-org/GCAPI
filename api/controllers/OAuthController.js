/**
 * OAuthController
 *
 * @module		:: Controller
 * @description	:: OAuth.
 */

var version = require('../../package.json').version,
	git = require('git-rev');

module.exports = {

	listApps: function (req, res) {
		Client.find().done(function (err, clients) {
			if (err) throw err;

			res.json(clients);
		});
	},

	registerApp: function (req, res) {

		if (!req.body.name) {
			return res.json(400, {
				error: "name is not defined",
				documentation_url: docs_url
			});
		}
		if (!req.body.redirectURI) {
			return res.json(400, {
				error: "redirectURI is not defined",
				documentation_url: docs_url
			});
		}
		if (!req.body.homeURI) {
			return res.json(400, {
				error: "homeURI is not defined",
				documentation_url: docs_url
			});
		}
		if (!req.body.owner) {
			return res.json(400, {
				error: "owner is not defined",
				documentation_url: docs_url
			});
		}
		if (!req.body.description) {
			return res.json(400, {
				error: "description is not defined",
				documentation_url: docs_url
			});
		}
		if (!req.body.scope) {
			return res.json(400, {
				error: "scope is not defined",
				documentation_url: docs_url
			});
		}

		var clientSecret = gcapi.generateUID(64);

		gcdb.user.getByLogin(req.body.owner, 'gcdb', function (err, uid) {
			Client.create({
				name: req.body.name,
				clientSecret: clientSecret,
				redirectURI: req.body.redirectURI,
				homeURI: req.body.homeURI,
				owner: uid,
				scope: req.body.scope,
				description: req.body.description
			}).done(function (err, client) {
				if (err) throw err;

				res.json({
					message: "Success",
					client: client
				});
			});
		});
	}
};
