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

		gcdb.user.getByLogin(req.body.owner, 'gcdb', function (err, uid) {
			Client.findOrCreate({
				name: req.body.name
			}).done(function (err, client) {
				if (err) throw err;

				client.name = req.body.name;
				if (!client.clientSecret) {
					client.clientSecret = gcapi.generateUID(64);
				} else if (req.body.generateSecret) {
					client.clientSecret = gcapi.generateUID(64);
				}
				client.redirectURI = req.body.redirectURI;
				client.homeURI = req.body.homeURI;
				client.owner = uid;
				client.scope = req.body.scope;
				client.description = req.body.description;

				res.json({
					message: "Success",
					client: client
				});
			});
		});
	}
};
