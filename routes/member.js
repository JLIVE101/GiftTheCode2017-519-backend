var express = require('express');
var uuid = require('uuid');
var nodemailer = require('nodemailer');
var dotenv = require('dotenv');
var jwt = require('jsonwebtoken');
var Member = require('../models/member');
var config = require('../config/config.json');
var memberRouter = express.Router();
var models = require('../models');
var tokenValidator = require('./tokenValidator');

var googleMapsClient = require('@google/maps').createClient({
    key: config.GOOGLEMAPS_API_KEY
});

// Add a new member
memberRouter.post('/save', function (req, res, next) {
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

// Update member
memberRouter.put('/member', [tokenValidator, function(req, res, next) {
    let body = req.body;

    models.Member.find({
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
        currentMember.inCatchment = body.withinCatchmentArea || currentMember.inCatchment;

        currentMember.save().then(function(saved) {
            }).catch(function(error) {
                console.log('Error updating members.');
            });

        models.Testimony.find({
            where: {
                memberId: currentMember.memberId
            }
        }).then(function(testimony) {
            testimony.testimony = body.testimony;
            testimony.save().then(function(saved) {
                }).catch(function(err) {
                    console.log('Error updating testimony');
                });
        }).catch(function(err) {
            console.log('Error getting testimony');
        });

        models.Status.find({
            where: {
                memberId: currentMember.memberId
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

        models.Permission.find({
            where: {
                permId: currentMember.memberId
            }
        }).then(function(permission) {
            permission.permSolicit = body.permissionForSoliciting;
            permission.permNewsletter = body.permissionForNewsletter;

            permission.save().then(function(saved) {
            }).catch(function(err) {
                console.log('Could not update permission.');
            });
        });
        res.json(currentMember);
    });
}]);

// Get individual member
memberRouter.get('/member/:email', [tokenValidator, function(req, res, next) {
    models.Member.find({
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

memberRouter.post('/login', function(req, res, next) {
    let body = req.body;

    if (!body.email || !body.password) {
        res.json({
            success: false
        });
        return;
    }

    //TODO: passwords should be hashed
    models.Member.find({
        include: [
            {model: models.Status},
            {model: models.Login,
            where: {
                password: body.password
            }},
            {model: models.Testimony},
            {model: models.Permission},
            {model: models.Household},
            {model: models.MemberPreference},            
        ],
        where: {
            email: body.email
        },
        raw: true
    }).then(function(member) {

        models.Status.find({
            where: {
                memberId: member.memberId
            }
        }).then(function(status) {

            console.log(status);

            status.lastLogin = new Date();
            status.save().then(function(saved) {
            }).catch(function(error) {
                console.log('Could not update user last login date.');
            });
        })

        let token = jwt.sign(member, config.tokenSecret, {
            expiresIn: '1h'
        });

        res.json({
            success: true,
            token: token
        });
        return;
        
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