/**
 * 403 (Forbidden) Handler
 *
 * Usage:
 * return res.forbidden();
 * return res.forbidden(err);
 * return res.forbidden(err, 'some/specific/forbidden/view');
 *
 * e.g.:
 * ```
 * return res.forbidden('Access denied.');
 * ```
 */

module.exports = function forbidden (data, options) {

	var req = this.req;
	var res = this.res;
	var sails = req._sails;

	var response = {
		message: 'Forbidden. Need authorization',
		documentation_url: docs_url
	};

	return res.status(403).jsonx(response);

};

