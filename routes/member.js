var express = require('express');
var uuid = require('uuid');
var nodemailer = require('nodemailer');
var dotenv = require('dotenv');
var config = require('../config/config.json');
var memberRouter = express.Router();
var db = require('../models/index');
var tokenValidator = require('./tokenValidator');

// password hashing
var bcrypt = require('bcrypt');
var saltRounds = 10;

var googleMapsClient = require('@google/maps').createClient({
    key: config.GOOGLEMAPS_API_KEY
});

// Add a new member
memberRouter.post('/member', function (req, res, next) {
    var body = req.body;

    // TODO: validate member object

    //triangulate location to set flag// Geocode an address.
    googleMapsClient.geocode({
        address: 'The 519 Catchment Area'
    }, function (err, response) {
        if (err) {
            console.log('Error finding catchment area.');
        }
    });

    //save the user
    db.Member.create({
        apartmentNumber: body.aptNumber,
        streetNumber: body.streetNumber,
        street: body.streetAddress,
        city: body.city,
        provinceState: body.province,
        country: body.country,
        postalCode: body.postalcode,
        phone: body.preferredPhone,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        membershipType: getMembershipType(body.status),
        permSolicit: body.permissionForSoliciting || false,
        permNewsletter: body.permissionForNewsletter || false,
        birthDate: new Date(body.birthdate),
        inCatchment: body.withinCatchmentArea || false,
        household: body && body.status ? body.status.toLowerCase() == 'household' : false,
        dateCreated: new Date(),
        testimony: body.testimony
    }).then(function(member) {

        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(body.password, salt, function(err, hash) {
                db.Login.create({
                    dbIndex: member.dbIndex,
                    password: hash,
                    lastLogin: new Date()
                }).then(function(login) {  
                }).catch(function(err) {
                    console.log('Could not create login for member');
                });        
            });
        })
        
        db.Status.create({
            dbIndex: member.dbIndex,
            active: false,
            confirmationHash: uuid(),
        }).then(function(status) {
            let updatedMember = {
                firstName: member.firstName,
                lastName: member.lastName,
                email: member.email  
            };
            // sendConfirmationEmail(updatedMember, status.hash);
        }).catch(function(err) {
            console.log('Could not create status for member.') ;
        });


        body.programs.forEach(function(program) {
            db.MemberPreference.create({
                dbIndex: member.dbIndex,
                categoryId: program.id,
                isPreferred: true
            });
        });

        res.json(member);
    });
});

// Update member
memberRouter.put('/member', [tokenValidator, function(req, res, next) {
    let body = req.body;

    db.Member.find({
        where: {
            email: body.email
        }
    }).then(function(currentMember) {
        if (!currentMember) {
            res.json({
                success: false
            });
            return;
        }

        console.log(currentMember);

        currentMember.apartmentNumber = body.aptNumber || currentMember.apartmentNumber;
        currentMember.streetNumber = body.streetNumber || currentMember.streetNumber;
        currentMember.street = body.streetAddress || currentMember.street;
        currentMember.city = body.city || currentMember.city;
        currentMember.provinceState = body.province || currentMember.provinceState;
        currentMember.country = body.country || currentMember.country;
        currentMember.postalCode = body.postalCode || currentMember.postalCode;
        currentMember.firstName = body.firstName || currentMember.firstName;
        currentMember.lastName = body.lastName || currentMember.lastName;
        currentMember.birthdate = body.birthdate ? new Date(body.birthdate) : currentMember.birthDate;
        currentMember.permSolicit = body.permissionForSoliciting || currentMember.permSolicit;
        currentMember.permNewsletter = body.permissionForNewsletter || currentMember.permNewsletter;        
        currentMember.inCatchment = body.withinCatchmentArea || currentMember.inCatchment;
        currentMember.testimony = body.testimony || currentMember.testimony;

        currentMember.save().then(function(saved) {
            }).catch(function(error) {
                console.log('Error updating members.');
            });

            db.Status.find({
            where: {
                dbIndex: currentMember.dbIndex
            }
        }).then(function(status) {
            status.active = true,
            status.renewalDate = new Date();

            status.save().then(function(saved) {
            }).catch(function(err) {
                console.log('Could not update user status');
            });

        }).catch(function(err) {
            console.log('Error getting status');
        });
        res.json(currentMember);
    });
}]);

// Get individual member
memberRouter.get('/member', [tokenValidator, function(req, res, next) {
    db.Member.find({
        include: [
            {model: db.Status},
            {model: db.MemberPreference},
        ],
        where: {
            email: req.decoded.email
        }
    }).then(function(member) {

        res.json({
            success: true,
            member: member
        });
        return;

        res.json({
            success: false
        });
    });
}]);


var getMembershipType = function(type) {
    if (!type) {
        return 0;
    }

    switch (type.toLowerCase()) {
        case "individual":
            return 0;
        case "household":
            return 1;
    }
}

// TODO: Update URL here to the permanent address.
var sendConfirmationEmail = function(member, hash) {
    let mailOptions = {
        from: 'The 519 <giftthecode519@gmail.com>',
        to: `${member.firstName} ${member.lastName} <${member.email}>`,
        subject: 'Complete your 519.org registration', // Subject line
        html: `
<p>Thanks for signing up as a member for the 519.org!<p>
<p>Please click the link below to complete your registration:</p>
<p><a href="http://159.203.45.55:8080/api/confirmAccount/${hash}"><button>Click here</button></a></p>
<small>Please do not reply to this email.</small>
        `
    };

    console.log(mailOptions);
    sendEmail(mailOptions);
}

// TODO: Update URL here to the permanent address.
// The URL here should go to the front end. The hash should be a hidden field that gets passed
// back to the API when the form is completed.
var sendPasswordResetEmail = function(member, hash) {
    let mailOptions = {
        from: 'The 519 <giftthecode519@gmail.com>',
        to: `${member.firstName} ${member.lastName} <${member.email}>`,
        subject: 'The 519 account password reset', 
        html: `
<p>You've requested a password reset for your 519.org account. You can click the link below to reset the password.<p>
<p><a href="http://159.203.45.55:8080/reset/${hash}"><button>Click here</button></a></p>
<p>If you haven't requested a password reset, you can ignore this email.</p>
<small>Please do not reply to this email.</small>
        `
    };

    console.log(mailOptions);
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