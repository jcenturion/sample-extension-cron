var express              = require('express');
var app                  = express();
var ManagementClient = require('auth0').ManagementClient;
var Request              = require('superagent');
var metadata             = require('./webtask.json');

function job (req, res) {
  req.auth0
    .getConnections()
    .then(function (connections) {
      res.status(200).send(connections);
    });
}

app.use(function (req, res, next) {
  var apiUrl       = 'https://' + req.webtaskContext.data.AUTH0_DOMAIN + '/oauth/token';
  var audience     = 'https://' + req.webtaskContext.data.AUTH0_DOMAIN + '/api/v2/';
  var clientId     = req.webtaskContext.data.AUTH0_CLIENT_ID;
  var clientSecret = req.webtaskContext.data.AUTH0_CLIENT_SECRET;

  Request
    .post(apiUrl)
    .send({
      audience:      audience,
      grant_type:    'client_credentials',
      client_id:     clientId,
      client_secret: clientSecret
    })
    .type('application/json')
    .end(function(err, res){
      if (err || !res.ok) {
        console.log('err');
      } else {
        req.auth0 = new ManagementClient({
          token:  res.body.access_token,
          domain: req.webtaskContext.data.AUTH0_DOMAIN
        });
      }

      next();
    });
});

app.get ('/', job);
app.post('/', job);

// This endpoint would be called by webtask-gallery to dicover your metadata
app.get('/meta', function (req, res) {
  res.status(200).send(metadata);
});

module.exports = app;
