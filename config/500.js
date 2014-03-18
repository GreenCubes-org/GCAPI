/**
 * 500.
 *
 * For more information on error handling in Sails/Express, check out:
 * http://expressjs.com/guide.html#error-handling
 */

module.exports[500] = function serverErrorOccurred(errors, req, res, expressErrorHandler) {

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
			message: displayedErrors[i].message,
			stack: displayedErrors[i].stack
		};

		// Log error to log adapter
		sails.log.error(displayedErrors[i].stack);
	}

	// In production, don't display any identifying information about the error(s)
	if (sails.config.environment === 'development') {
		response.errors = displayedErrors;
	}

	res.status(500).json(response);

};
