/**
 * Allow only cfg.OAuthAdmins.
 */
module.exports = function (req, res, ok) {

	var username = (req.user) ? req.user.login || req.user.username : null;

	if (_.contains(cfg.OAuthAdmins, username)) {
		ok();
	} else {
		res.status(403).json({
			message: 'Forbidden. Need authorization',
			documentation_url: docs_url
		});
	}
};
