var express = require('express');
var app = express();

app.get('/status', function(req, res) {
    res.statusCode = 200;
    res.send({"message": "Nice!"});
})

var port = process.env.PORT || 8080
app.listen(port, function() {
    console.log('Node Find My iPhone API running on port ' + port);
});

exports = module.exports = app;