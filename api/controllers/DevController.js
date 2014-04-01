/**
 * DevController
 *
 * @module		:: Controller
 * @description	:: Debug/Developer stuff.
 */

var execFile = require('child_process').execFile;

module.exports = {

	deploymentWebHook: function (req, res) {
		if (!req.body.payload) {
			return res.json(404, {
				message: 'Not Found',
				documentation_url: docs_url
			});
		}
		
		var payload = req.body.payload;
		
		if (payload.ref === 'ref/heads/master') {
			execFile(__dirname + '../../scripts/deploy.sh', function(err, stdout, stderr) {
				if (err) throw err;
            });
		}
	}

};
