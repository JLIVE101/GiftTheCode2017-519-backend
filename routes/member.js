var express = require('express');
var Member = require('../models/member');
var config = require('../config/config.json');
var memberRouter = express.Router();
var models = require('../models');

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

//confirm account creation
memberRouter.post('/confirm/{hash}', function(req, res, next) {
    // check that the hash exists
        // mark account active
        // send OK
    
});

memberRouter.post('/member', function(req, res, next) {
    models.Member.create({
        username: req.body.filed
    }).then(function(member) {
        res.send() ; //send JSON respons.
    });
});

// delete this route later! Just here to test Sequelize.
memberRouter.get('/member', function(req, res, next) {
    models.Member.findAll({

    }).then(function(members) {
        res.json(members);
    });
});

module.exports = memberRouter;