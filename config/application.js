var passport = require('passport'),
    oauth2orize = require('oauth2orize'),
    login = require('connect-ensure-login'),
    utils = require('../utils.js');
module.exports = {
    
    appName: "sails-oauth-provider",
    port: 1337,
    environment: "development",
    express: {
        customMiddleware: function(app)
        {

            /** oAuth Server **/

            app.use(passport.initialize());
            app.use(passport.session());

            var server = oauth2orize.createServer();
            server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, done) {
              var code = utils.uid(16);
              Authcode.create({
                code: code,
                clientId: client.id,
                redirectURI: redirectURI,
                userId: user.id,
                scope: ares.scope
              }).done(function(err,code){
                if(err){return done(err,null);}
                return done(null,code.code);
              });
            }));



            // the token exchange
            server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
              Authcode.findOne({
                code: code
              }).done(function(err,code){
                if (err || !code) {
                    return done(err);
                }
                if (client.id !== code.clientId) {
                    return done(null, false);
                }
                if (redirectURI !== code.redirectURI) {
                    return done(null, false);
                }

                var token = utils.uid(256);
                Token.create({
                  token: token,
                  userId: code.userId,
                  clientId: code.clientId,
                  scope: code.scope
                }).done(function(err,token){
                  if (err) {
                    return done(err); 
                  }
                  return done(null, token);
                });
              });
            }));

            
            app.get('/oauth/authorize', login.ensureLoggedIn(), server.authorize(function (clientID, redirectURI, done) {
                Client.findOne({
                    id: clientID
                }, function (err, cli) {

                    if (err) {
                        return done(err);
                    }
                    if (!cli) {
                        return done(null, false);
                    }
                    if (cli.redirectURI != redirectURI) {
                        return done(null, false);
                    }
                    return done(null, cli, cli.redirectURI);
                });
            }), function (req, res) {
                res.render('dialog', {
                    transactionID: req.oauth2.transactionID,
                    user: req.user,
                    cli: req.oauth2.client
                });
            });


            app.post('/oauth/authorize/decision',
              login.ensureLoggedIn(),
              server.decision());


            server.serializeClient(function(client, done) {
              return done(null, client.id);
            });

            server.deserializeClient(function(id, done) {
              Client.findOne(id, function(err, client) {
                if (err) { return done(err); }
                return done(null, client);
              });
            });


            app.post('/token',
              passport.authenticate('oauth2-client-password', { session: false }),
              server.token(),
              server.errorHandler());

            //this function is only to test callbacks
            app.get('/testCallback',function(req,res){
              res.render('test',{params:req.query});
            });
        }
    }
};
