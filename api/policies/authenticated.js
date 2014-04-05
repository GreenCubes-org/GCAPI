/**
 * Allow any authenticated user.
 */
module.exports = function (req, res, ok) {

  // User is allowed, proceed to controller
  if (req.session.authenticated) {
    return ok();
  }

  // User is not allowed
  else {
    return res.status(403).json({
		message: 'Forbidden. Need authorization',
		documentation_url: docs_url
	});
  }
};
