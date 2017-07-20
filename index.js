var express = require('express');
var app = express();
var icloud = require("find-my-iphone").findmyphone;

icloud.apple_id = process.env.APPLE_ID;
icloud.password = process.env.APPLE_PASSWORD;

var homeLatitude = process.env.HOME_LATITUDE;
var homeLongitude = process.env.HOME_LONGITUDE;

app.get('/status/:forceAlert', function(req, res) {
    var forceAlert = req.params.forceAlert;
    icloud.getDevices(function(error, devices) {
        if (error) {
            res.status = 404;
            res.send({"error": error});
        } else {
            var iPhone = devices.find(o => o.deviceDisplayName === 'iPhone 7 Plus'); // query your devices and choose your label here
            icloud.getDistanceOfDevice(iPhone, homeLatitude, homeLongitude, function(err, result) {
                var distance = result.distance.value;
                if (err) {
                    res.status = 404;
                    res.send({"error": err});
                } else {
                    if (result.distance.value > 100 || forceAlert == true) {
                        icloud.alertDevice(iPhone.id, function(err) {
                            if (err) {
                                res.status = 404;
                                res.send({"error": err});
                            } else {
                                icloud.getLocationOfDevice(iPhone, function(err, location) {
                                    if (err) {
                                        res.status = 404;
                                        res.send({"error": err});
                                    } else {
                                        res.statusCode = 200;
                                        res.send({"distance": result.distance.value + " meters", "alertSent": true, "address": location});
                                    }
                                });
                                
                            }
			            });
                    } else {
                        res.statusCode = 200;
                        res.send({"distance": result.distance.value + " meters", "alertSent": false});
                    }
                }
			});
        }
    });
})

var port = process.env.PORT || 8080
app.listen(port, function() {
    console.log('Node Find My iPhone API running on port ' + port);
});

exports = module.exports = app;