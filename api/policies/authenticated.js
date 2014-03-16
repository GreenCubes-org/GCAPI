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
	var response = {
		message: 'Forbidden. Need authorization',
		documentation_url: sails.docs_url
	};

    return res.status(403).json(response);
  }
};
