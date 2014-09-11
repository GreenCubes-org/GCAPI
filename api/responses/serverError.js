/**
 * 500 (Server Error) Response
 *
 * Usage:
 * return res.serverError();
 * return res.serverError(err);
 * return res.serverError(err, 'some/specific/error/view');
 *
 * NOTE:
 * If something throws in a policy or controller, or an internal
 * error is encountered, Sails will call `res.serverError()`
 * automatically.
 */

module.exports = function serverError(data, options) {

	// Get access to `req`, `res`, & `sails`
	var req = this.req;
	var res = this.res;
	var sails = req._sails;

	// Ensure that `errors` is a list
	var displayedErrors = (typeof errors !== 'object' || !errors.length) ? [errors] : errors;

	// Build data for response
	var response = {
		message: 'Internal Server Error',
		documentation_url: docs_url
	};

	// Ensure that each error is formatted correctly
	var inspect = require('util').inspect;
	for (var i in displayedErrors) {

		// Make error easier to read, and normalize its type
		if (!(displayedErrors[i] instanceof Error)) {
			displayedErrors[i] = new Error(inspect(displayedErrors[i]));
		}

		displayedErrors[i] = {
			message: displayedErrors[i].message
		};

		// Log error to log adapter
		sails.log.error(displayedErrors[i].stack);
	}

	return res.status(500).jsonx(response);
};
