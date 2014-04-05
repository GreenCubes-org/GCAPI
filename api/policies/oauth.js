/**
* oAuth 2 token policy
**/
var passport = require('passport');

module.exports = function(req,res,next) {
	passport.authenticate(
	    'bearer',
	    function(err, user, info)
	    {
	        if ((err) || (!user))
	        {
				return res.status(403).json({
					message: 'Forbidden. Need authorization',
					documentation_url: docs_url
				});
	        }
            delete req.query.access_token;
	        req.user = user;
	        return next();
	    }
	)(req, res);
};