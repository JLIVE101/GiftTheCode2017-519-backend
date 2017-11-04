var express = require('express');
var Member = require('../models/member');
var config = require('../config.json');
var memberRouter = express.Router();

var googleMapsClient = require('@google/maps').createClient({
    key: config.GOOGLEMAPS_API_KEY
});


memberRouter.post('/save', function (req, res, next) {

    var body = req.body;

    //validate member object

    //triangulate location to set flag// Geocode an address.
    googleMapsClient.geocode({
        address: 'The 519 Catchment Area'
    }, function (err, response) {
        if (!err) {
            res.send(response);
        }
    });


    //save the user



});

module.exports = memberRouter;