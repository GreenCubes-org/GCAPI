/**
 * Default 404 (not found) handler
 *
 * If no matches are found, Sails will respond using this handler:
 *
 * For more information on 404/notfound handling in Sails/Express, check out:
 * http://expressjs.com/faq.html#404-handling
 */

module.exports[404] = function pageNotFound(req, res, express404Handler) {

	var result = {
		status: 404
	};

	res.status(404).json(result);

};
