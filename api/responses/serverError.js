module.exports = function serverError(data, options) {
	// Get access to `req`, `res`, & `sails`
	var req = this.req;
	var res = this.res;
	var sails = req._sails;
	var datetime = Date();
	var response;
	// Set status code
	res.status(500);

	sails.log.error('datetime: ', datetime, '\n', data);

	if (req.user && _.contains(cfg.userStatusException, req.user.login)) {
		response = {
			message: 'Internal Server Error',
			documentation_url: docs_url,
			error: data
		};
	} else {
		// Build data for response
		response = {
			message: 'Internal Server Error',
			documentation_url: docs_url
		};
	}

	return res.status(500).jsonx(response);
};
