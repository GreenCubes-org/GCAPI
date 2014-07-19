/**
*  Scope 'regions'
**/
var gcapi = require('../../utils/gcapi');

module.exports = function (req, res, next) {
	gcapi.scopePolice('regions', req, res, next);
};
