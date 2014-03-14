/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.bootstrap = function (cb) {

  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  Client.create({
  	name: 'testClient',
  	clientSecret: '123test',
  	redirectURI: 'http://127.0.0.1:1337/testCallback',
  	text: 'just a test client'
  }).done(function(err,client){
  	console.log("Created test client: "+client.name);
  });

  User.create({
  	name: 'testUser',
  	password: 'password',
  	email: 'test@example.com'
  }).done(function(err,user){
  	console.log("Created test user: "+user.name);
  });
  cb();
};