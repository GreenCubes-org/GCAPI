/**
 * DevController
 *
 * @module		:: Controller
 * @description	:: Debug/Developer stuff.
 */

module.exports = {

	res: function (req, res) {
		console.log(res);
	},

	req: function (req, res) {
		console.log(req);
	},

	session: function (req, res) {
		console.log(req.session);
	},

	user: function (req, res) {
		var user = {
			isAuthenticated: null,
			username: null,
			id: null
		};

		if (req.isAuthenticated()) user.isAuthenticated = true
			else return res.json(user);

		user = {
			isAuthenticated: user.isAuthenticated,
			username: req.user.username,
			id: req.session.passport.user
		};

		res.json(user);
	}


};
