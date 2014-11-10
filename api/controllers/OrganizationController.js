
module.exports = {

	orgInfo: function (req, res) {
		var orgId = parseInt(req.param('org'), 10);

		/* We're accepting only numbers */
		if (isNaN(orgId)) {
			return res.badRequest();
		}

		orgdbconn.query('SELECT * FROM organizations WHERE id = ? AND hidden = 0 AND deleted = 0 AND accepted = 1', [orgId], function (err, result) {
			if (err) return res.serverError(err);

			if (result.length !== 0) {
				res.json({
					id: result[0].id,
					tag: result[0].tag,
					title: result[0].title,
					subtitle: result[0].subtitle,
					url: 'https://greencubes.org/org/' + result[0].
				});
			} else {
				res.notFound();
			}
		});


	}

};
