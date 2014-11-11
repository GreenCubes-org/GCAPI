
module.exports = {

	orgInfo: function (req, res) {
		var orgInt = parseInt(req.param('org'), 10),
			org = (orgInt) ? orgInt : req.param('org').replace(/[^a-zA-Z0-9_-]/g, ''),
			query;

		/* We're accepting only numbers */
		if (org != req.param('org')) {
			return res.json(404, {
				message: 'Organization doesn\'t exists',
				documentation_url: docs_url
			});
		}

		// If number (id)
		if (!isNaN(org)) {
			query = 'id = "' + org + '"';
		// If not number => string (tag)
		} else {
			query = 'tag = "' + org + '"';
		}

		orgdbconn.query('SELECT * FROM organizations WHERE ' + query + ' AND hidden = 0 AND deleted = 0 AND accepted = 1', function (err, result) {
			if (err) return res.serverError(err);

			if (result.length !== 0) {
				res.json({
					id: result[0].id,
					tag: result[0].tag,
					title: result[0].title,
					subtitle: result[0].subtitle,
					url: 'https://greencubes.org/org/' + result[0].id
				});
			} else {
				res.notFound();
			}
		});


	}

};
