/**
 * 403
 *
 * For more information on 404/notfound handling in Sails/Express, check out:
 * http://expressjs.com/faq.html#404-handling
 */

module.exports[403] = function forbidden(req, res, express404Handler) {

	var response = {
		message: 'Forbidden. Need authorization',
		documentation_url: docs_url
	};

	res.status(403).json(response);

};
