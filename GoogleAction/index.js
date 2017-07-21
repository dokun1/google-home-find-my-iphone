var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var authToken = process.env.AUTH_TOKEN;

app.use(bodyParser.json()); // support json encoded bodies

app.post('/findPhone', function(req, res) {

});

var port = process.env.PORT || 8080
app.listen(port, function() {
  console.log('Node Find My iPhone API running on port ' + port);
});

exports = module.exports = app;