var express = require('express');
var app = express();
var icloud = require("find-my-iphone").findmyphone;
var bodyParser = require('body-parser');

icloud.apple_id = process.env.APPLE_ID;
icloud.password = process.env.APPLE_PASSWORD;

var homeLatitude = process.env.HOME_LATITUDE;
var homeLongitude = process.env.HOME_LONGITUDE;

var authToken = process.env.AUTH_TOKEN;

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.post('/status', function(req, res) {
    var forceAlert = req.body.forceAlert;
    if (forceAlert == true) {
        console.log("Will force an alert");
    }
    var token = req.body.authToken;
    if (token != authToken || !token) {
        console.log("Auth token incorrect");
        res.status = 401;
        res.send({"Error": "Incorrect Auth Token"});
    } else {
        console.log("Getting iCloud Devices");
        icloud.getDevices(function(error, devices) {
        if (error) {
            console.log("Could not load iCloud devices");
            res.status = 404;
            res.send({"error": error});
        } else {
            console.log("Found " + devices.length + " devices");
            var iPhone = devices.find(o => o.deviceDisplayName === 'iPhone 7 Plus'); // query your devices and choose your label here
            icloud.getDistanceOfDevice(iPhone, homeLatitude, homeLongitude, function(err, result) {
                if (err) {
                    console.log("Could not get distance");
                    res.status = 404;
                    res.send({"error": err});
                } else {
                    var distance = result.distance.value;
                    console.log("Distance found: " + result);
                    if (result.distance.value > 100 || forceAlert == true) {
                        console.log("Distance from device greater than 100 meters - alerting device and getting address.");
                        icloud.alertDevice(iPhone.id, function(err) {
                            if (err) {
                                console.log("Could not alert device");
                                res.status = 404;
                                res.send({"error": err});
                            } else {
                                console.log("Device alerted");
                                icloud.getLocationOfDevice(iPhone, function(err, location) {
                                    if (err) {
                                        console.log("Could not get location of device");
                                        res.status = 404;
                                        res.send({"error": err});
                                    } else {
                                        console.log("Device located: " + location);
                                        res.statusCode = 200;
                                        res.send({"distance": result.distance.value + " meters", "alertSent": true, "address": location});
                                    }
                                });
                                
                            }
			            });
                    } else {
                        console.log("Distance from device less than 100 meters.");
                        res.statusCode = 200;
                        res.send({"distance": result.distance.value + " meters", "alertSent": false});
                    }
                }
			});
        }
    });
    }
})

var port = process.env.PORT || 8080
app.listen(port, function() {
    console.log('Node Find My iPhone API running on port ' + port);
});

exports = module.exports = app;