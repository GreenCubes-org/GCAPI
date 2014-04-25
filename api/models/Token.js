/**
 * Token
 *
 * @module      :: Model
 * @description :: Access tokens for oAuth 2 clients
 *
 */

module.exports = {

  attributes: {
  	
  	token: {
  		type: 'text'
  	},

  	userId: {
  		type: 'INTEGER'
  	},

  	clientId: {
  		type: 'INTEGER'
  	},

  	scope: {
  		type: 'STRING'
  	}
    
  }

};
