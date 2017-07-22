var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var promise = require('request-promise');
var http = require('http');

var APIAuthToken = process.env.AUTH_TOKEN;
var microURI = process.env.FMIAPIURI;

app.use(bodyParser.json()); // support json encoded bodies

function formOutput(body) {
  var distance = body['distance'];
  var alertSent = body['alertSent'];
  var address = body['address'];
  if (address) {
    return "Your phone is approximately" + distance + " away from you. The closest address I could find is " + address;
  } else {
    return "Your phone is approximately " + distance + " away from you. ";
  }
}

app.post('/findPhone', function(req, res) {
  var alarm = req.body.AlarmEntity;
  let force = false;
  if (alarm) {
    console.log("Will request alarm force");
    force = true;
  }
  var options = {
    method: 'POST',
    uri: microURI,
    body: {
      authToken: APIAuthToken,
      forceAlert: force
    },
    json: true
  };
  console.log("Making POST request to " + microURI);
  res.setHeader('Content-Type', 'application/json');
  promise(options).then(function(parsedBody) {
    // handle proper response
    console.log("Request successful: " + parsedBody);
    res.send(JSON.stringify({'speech': formOutput(parsedBody), 'displayText': formOutput(parsedBody)}));
  }).catch(function(err) {
    // something failed
    console.log("An error occurred: " + err);
    res.send(JSON.stringify({'speech': 'Oops, something bad happened' + err, 'displayText': 'Oops, something bad happened'}));
  });
});

var port = process.env.PORT || 8090
app.listen(port, function() {
  console.log('Node Google Action Webhook for Find My iPhone API running on port ' + port);
});

exports = module.exports = app;