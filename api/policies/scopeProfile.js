/**
*  Scope 'profile'
**/
var gcapi = require('../../utils/gcapi');

module.exports = function (req, res, next) {
	gcapi.scopePolice('profile', req, res, next);
};
