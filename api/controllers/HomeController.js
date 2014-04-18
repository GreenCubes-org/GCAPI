/**
 * HomeController
 *
 * @module		:: Controller
 * @description	:: Index controller.
 */

module.exports = {

	index: function (req, res) {
		res.json({
			user_url: 'https://api.greencubes.org/users/{user}',
			current_user_url: 'https://api.greencubes.org/user',
			main_status_url: 'https://api.greencubes.org/main/status',
			main_economy_url: 'https://api.greencubes.org/main/economy',
			main_named_colors_url: 'https://api.greencubes.org/main/named_colors',
			main_named_colors_html_url: 'https://api.greencubes.org/main/named_colors/html',
			rpg_status_url: 'https://api.greencubes.org/rpg/status',
			apocalyptic_status_url: 'https://api.greencubes.org/apocalyptic/status',
			meta_url: 'https://api.greencubes.org/meta',
			rate_limit_url: 'https://api.greencubes.org/rate_limit',
			documentation_url: docs_url
		});
	}
};
