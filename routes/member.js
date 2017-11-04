var express = require('express');
var uuid = require('uuid');
var nodemailer = require('nodemailer');
var dotenv = require('dotenv');
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

memberRouter.post('/member', function(req, res, next) {
    models.Member.create({
        streetAddress: req.body.streetAddress,
        city: req.body.city,
        province_state: req.body.province_state,
        country: req.body.country,
        phone_mobile: req.body.phone_mobile,
        phone_work: req.body.phone_work,
        phone_home: req.body.phone_home,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        membership_type: req.body.membership_type,
        birthdate: req.body.birthdate,
        inCatchment: req.body.inCatchment || false,
        household: req.body.household || false
    }).then(function(member) {

        //make dependent models
        models.Permission.create({
            perm_id: member.memberId,
            perm_email: req.body.perm_email || false,
            perm_mail: req.body.perm_mail || false,
            perm_phone: req.body.perm_phone || false,
            perm_solicit: req.body.perm_solicit || false,
            perm_newsletter: req.body.perm_newsletter || false
        });

        models.Status.create({
            memberId: member.memberId,
            active: false,
            hash: uuid(),
            lastLogin: new Date()
        }).then(function(status) {
            sendConfirmationEmail(member, status.hash);
        });

        if (member.household) {
            // assuming res.body contains array of other household members
            res.body.householdMembers.forEach(function(householdMember) {
                models.Household.create({
                    relationship_id: member.memberId,
                    relationship_type: householdMember.relationship_type,
                    firstName: householdMember.firstName,
                    lastName: householdMember.lastName
                });
            });
        }

        res.json(member);
    });
});

// delete this route later! Just here to test Sequelize.
memberRouter.get('/member', function(req, res, next) {
    models.Member.findAll({

    }).then(function(members) {
        res.json(members);
    });
});

//confirm account creation
memberRouter.get('/confirmAccount/:hash', function(req, res, next) {

    console.log('params: ', req.params);

    models.Member.findAll({        
        include: [{
            model: models.Status,
            where: {
                hash: req.params.hash
            }
        }]
    }).then(function(status) {
        
        if (!status || status.length == 0 || !status[0].dataValues) {
            res.json({
                success: false
            });
            return;
        }

        status = status[0].dataValues;
        if (!status.Status.dataValues.hash || status.Status.dataValues.hash == '00000000-0000-0000-0000-000000000000') {
            res.json({
                success: false
            });
            return;
        }

        models.Status.update({
            hash: '00000000-0000-0000-0000-000000000000',
            active: true
        }, {
            where: {
                hash: status.Status.dataValues.hash
            }
        }).then(function(member) {
            let updatedMember = {
                firstName: status.firstName,
                lastName: status.lastName,
                email: status.email  
            };
            sendConfirmationEmail(updatedMember, req.params.hash);

            res.json({
                success: true
            });
        });
    }).catch(function(err) {

        console.log(err);

        res.json({
            success: false,
            message: err
        });
    });
});

// TODO: reset password route

var sendConfirmationEmail = function(member, hash) {
    let mailOptions = {
        from: 'weirdvector <weirdvector@gmail.com>',
        to: `${member.firstName} ${member.lastName} <${member.email}>`,
        subject: 'Complete your 519.org registration', // Subject line
        html: `
<p>Thanks for signing up as a member for the 519.org!<p>
<p>Please click the link below to complete your registration:</p>
<p><a href="http://159.203.45.55:8080/api/confirmAccount/${hash}"><button>Click here</button></a></p>
<small>Please do not reply to this email.</small>
        `
    };
    sendEmail(mailOptions);
}

var sendEmail = function(message) {
    nodemailer.createTestAccount(function(err, account) {
        let parsed = dotenv.load().parsed;

        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: parsed['smtp.user'],
                pass: parsed['smtp.pass']
            }
        });

        transporter.sendMail(message, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    });
};

module.exports = memberRouter;