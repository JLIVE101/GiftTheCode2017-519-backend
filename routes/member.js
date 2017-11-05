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
    // TODO: might need to JSON.parse(body); 

    //validate member object

    //triangulate location to set flag// Geocode an address.
    googleMapsClient.geocode({
        address: 'The 519 Catchment Area'
    }, function (err, response) {
        if (err) {
            console.log('Error finding catchment area.');
        }
    });

    //save the user
    models.Member.create({
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
        birthDate: new Date(body.birthdate),
        inCatchment: body.withinCatchmentArea || false,
        household: body.status.toLowerCase() == 'household',
        dateCreated: new Date()
    }).then(function(member) {

        models.Login.create({
            memberId: member.memberId,
            password: body.password
        }).then(function(login) {  
        }).catch(function(err) {
            console.log('Could not create login for member');
        });

        //make dependent models
        models.Permission.create({
            permId: member.memberId,
            permSolicit: body.permissionForSoliciting || false,
            permNewsletter: body.permissionForNewsletter || false
        }).then(function(permission) {
        }).catch(function(err) {
            console.log('Could not create permission for member');
        });

        models.Status.create({
            memberId: member.memberId,
            active: false,
            hash: uuid(),
            lastLogin: new Date()
        }).then(function(status) {
            let updatedMember = {
                firstName: member.firstName,
                lastName: member.lastName,
                email: member.email  
            };
            sendConfirmationEmail(updatedMember, status.hash);
        }).catch(function(err) {
            console.log('Could not create status for member.') ;
        });

        // TODO: extra logic for household members
        // if (member.household) {
            // assuming res.body contains array of other household members
            // body.householdMembers.forEach(function(householdMember) {
            //     models.Household.create({
            //         relationshipId: member.memberId,
            //         relationshipType: householdMember.relationship_type,
            //         firstName: householdMember.firstName,
            //         lastName: householdMember.lastName
            //     }).then(function(member) {
            //     }).catch(function(err) {
            //         console.log('Could not create household member for member.');                    
            //     });
            // });
        // }

        models.Testimony.create({
            memberId: member.memberId,
            testimony: body.testimony
        });

        body.programs.forEach(function(program) {
            models.MemberPreference.create({
                memberId: member.memberId,
                categoryId: program.id,
                isPreferred: true
            });
        });

        res.json(member);
    });
});

// delete this route later! Just here to test Sequelize.
// memberRouter.get('/member', function(req, res, next) {
//     models.Member.findAll({

//     }).then(function(members) {
//         res.json(members);
//     });
// });

// TODO: update member route. Out of scope for hackathon :/
// memberRouter.put('/member/:email', function(req, res, next) {

//     let body = req.body;

//     models.Member.findAll({
//         where: {
//             email: req.params.email
//         }
//     }).then(function(currentMember) {
//         if (currentMember.length == 0) {
//             res.json({
//                 success: false
//             });
//         }

//         currentMember.apartmentNumber = body.aptNumber || current.apartmentNumber;
//         currentMember.streetNumber = body.streetNumber || currentMember.streetNumber;
//         currentMember.street = body.streetAddress || currentMember.street;
//         currentMember.city = body.city || currentMember.city;
//         currentMember.provinceState = body.province || currentMember.provinceState;
//         currentMember.country = body.country || currentMember.country;
//         currentMember.postalCode = body.postalCode || currentMember.postalCode;
//         currentMember.firstName = body.firstName || currentMember.firstName;
//         currentMember.lastName = body.lastName || currentMember.lastName;
//         currentMember.birthdate = body.birthdate ? new Date(body.birthdate) : currentMember.birthDate;
//         currentMember.inCatchment = body.withinCatchmentArea || currentMember.inCatchment;
//     });

//     res.json(member);
// });

memberRouter.get('/member/:email', function(req, res, next) {
    models.Member.findAll({
        include: [
            {model: models.Status},
            {model: models.Login},
            {model: models.Testimony},
            {model: models.Permission},
            {model: models.Household},
            {model: models.MemberPreference},            
        ],
        where: {
            email: req.params.email
        }
    }).then(function(member) {
        if (member.length > 0) {
            res.json({
                success: true,
                member: member
            });
            return;
        }
        res.json({
            success: false
        });
    });
});

//confirm account creation
memberRouter.get('/confirmAccount/:hash', function(req, res, next) {
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
            res.redirect(302, '/home'); // TODO: redirect to landing page
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

var getMembershipType = function(type) {
    switch (type.toLowerCase()) {
        case "individual":
            return 0;
        case "household":
            return 1;
    }
}

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