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
		Client.find().exec(function (err, clients) {
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
		if (!req.body.internal) {
			return res.json(400, {
				error: "internal is not defined",
				documentation_url: docs_url
			});
		}

		gcdb.user.getByLogin(req.body.owner, 'gcdb', function (err, uid) {
			Client.create({
				name: req.body.name,
				clientSecret: gcapi.generateUID(64),
				redirectURI: req.body.redirectURI,
				homeURI: req.body.homeURI,
				owner: uid,
				scope: req.body.scope,
				description: req.body.description,
				internal: req.body.internal
			}).exec(function (err, client) {
				if (err) throw err;

				gcdb.user.getByID(client.owner, 'gcdb', function (err, login) {
					if (err) throw err;

					client.owner = login;
					res.json({
						message: "Success",
						client: client
					});
				});
			});
		});
	},

	editApp: function (req, res) {

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
		if (!req.body.internal) {
			return res.json(400, {
				error: "internal is not defined",
				documentation_url: docs_url
			});
		}

		gcdb.user.getByLogin(req.body.owner, 'gcdb', function (err, uid) {
			Client.findOne({
				id: parseInt(req.params.id, 10)
			}).exec(function (err, client) {
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
				client.internal = req.body.internal == 'true';

				client.save(function (err) {
					if (err) throw err;

					gcdb.user.getByID(client.owner, 'gcdb', function (err, login) {
						if (err) throw err;

						client.owner = login;
						res.json({
							message: "Success",
							client: client
						});
					});
				});
			});
		});
	},

	getApp: function (req, res) {
		Client.findOne({
			id: parseInt(req.params.id, 10)
		}).exec(function (err, client) {
			if (err) throw err;

			if (!client) {
				res.json(400, {
					message: 'wrong id',
					documentation_url: docs_url
				})
			} else {
				gcdb.user.getByID(client.owner, 'gcdb', function (err, login) {
					if (err) throw err;

					client.owner = login;
					res.json(client);
				});
			}
		});
	},

	deleteApp: function (req, res) {
		async.waterfall([
			function destroyClient(callback) {

				var clientId = parseInt(req.params.id, 10);

				Client.findOne({
					id: clientId
				}).exec(function (err, client) {
					if (err) return callback(err);

					if (client.length === 0) {
						return res.json(400, {
							message: 'wrong id',
							documentation_url: docs_url
						});
					} else {
						client.destroy(function(err) {
							if (err) return callback(err);

							callback(null, clientId);
						});
					}
				});
			},
			function removeAuthcodes(clientId, callback) {
				Authcode.destroy({
					id: parseInt(req.params.id, 10)
				}).exec(function (err) {
					if (err) return callback(err);

					callback(null, clientId);
				});
			},
			function removeTokens(callback) {
				Token.destroy({
					id: parseInt(req.params.id, 10)
				}).exec(function (err) {
					if (err) return callback(err);

					callback(null, clientId);
				});
			}
		], function (err) {
			if (err) throw err;

			res.json({
				message: "Success"
			});
		});
	}
};
