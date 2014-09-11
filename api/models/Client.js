/**
 * Client
 *
 * @module      :: Model
 * @description :: oAuth 2 clients
 *
 */

module.exports = {

	attributes: {

		name: {
			type: 'STRING',
			required: true
		},

		clientSecret: {
			type: 'STRING',
			required: true
		},

		redirectURI: {
			type: 'STRING',
			required: true
		},

		homeURI: {
			type: 'STRING',
			required: true
		},

		owner: {
			type: 'INTEGER',
			required: true
		},
		
		scope: {
			type: 'STRING',
			required: true
		},

		description: {
			type: 'STRING',
			required: true
		},

		internal: {
			type: 'boolean',
			required: true
		}

	}

};
