/**
 * UserController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {

  me: function(req,res){
  	res.json({
  		username: req.user.name,
  		email: req.user.email,
  		id: req.user.id
  	});
  }
  

};
