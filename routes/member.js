var express = require('express');
var uuid = require('uuid');
var dotenv = require('dotenv');
var config = require('../config/config.json');
var memberRouter = express.Router();
var db = require('../models/index');
var mailer = require('../util/mailer')
var tokenValidator = require('../middleware/tokenValidator');

// password hashing
var bcrypt = require('bcrypt');
var saltRounds = 10;

// Add a new member
memberRouter.post('/member', function (req, res, next) {
    var body = req.body;

    if (!body ||
        !body.streetNumber ||
        !body.streetAddress || 
        !body.city ||
        !body.province ||
        !body.postalcode ||
        !body.preferredPhone || 
        !body.firstName || 
        !body.lastName ||
        !body.email ||
        !body.status || 
        !body.birthdate ||
        !body.password) {
        return res.json({
            success: false,
            message: 'Invalid request. Missing required fields.'
        });
    }

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
            mailer.sendConfirmationEmail(updatedMember, status.hash);
        }).catch(function(err) {
            console.log('Could not create status for member.') ;
        });

        if (body.programs) {
            body.programs.forEach(function(program) {
                db.MemberPreference.create({
                    dbIndex: member.dbIndex,
                    categoryId: program.id,
                    isPreferred: true
                });
            });
        }

        // TODO: should redirect to login instead with success message
        res.json(member);
    });
});

// Update member
memberRouter.put('/member', [tokenValidator, function(req, res, next) {
    let body = req.body;

    if (!body || !body.email) {
        return res.json({
            success: false,
            message: 'Invalid request.'
        });
    }

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

        currentMember.save()
            .then(function(saved) {
            }).catch(function(error) {
                return res.json({
                    success: false,
                    message: 'Could not update member.'
                });
            });

        db.Status.find({
            where: {
                dbIndex: currentMember.dbIndex
            }
        }).then(function(status) {
            status.active = true,
            status.renewalDate = new Date();

            status.save()
                .then(function(saved) {
                }).catch(function(err) {
                    console.error('Could not update user status.');
                });

        }).catch(function(err) {
            console.error('Could not find status for member with ID: ', currentMember.dbIndex);
        });

        // TODO: Is this the correct response for update?
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

module.exports = memberRouter;