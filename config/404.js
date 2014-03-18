/**
 * 404
 *
 * For more information on 404/notfound handling in Sails/Express, check out:
 * http://expressjs.com/faq.html#404-handling
 */

module.exports[404] = function pageNotFound(req, res, express404Handler) {

	var response = {
		message: 'Not Found',
		documentation_url: docs_url
	};

	res.status(404).json(response);

};
