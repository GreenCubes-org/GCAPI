/**
 * HomeController
 *
 * @module		:: Controller
 * @description	:: Index controller.
 */

module.exports = {

	index: function (req, res) {
		res.json({
			main_economy_url: 'https://api.greencubes.org/main/economy',
			user_url: 'https://api.greencubes.org/users/{user}',
			current_user_url: 'https://api.greencubes.org/user',
			api_info_url: 'https://api.greencubes.org/api/info',
			documentation_url: sails.docs_url
		});
	}
};
