
var express = require('express');
var uuid = require('uuid');
var jwt = require('jsonwebtoken');
var config = require('../config/config.json');
var accountRouter = express.Router();
var db = require('../models/index');
var mailer = require('../util/mailer');
var tokenValidator = require('../middleware/tokenValidator');
var bcrypt = require('bcrypt');
var saltRounds = 10;

// Login provides a token that is used to validate the authenticated endpoints.
accountRouter.post('/login', function(req, res, next) {
    let body = req.body;

    if (!body.email || !body.password) {
        res.json({
            success: false
        });
        return;
    }

    db.Member.find({
        include: [
            {model: db.Status},
            {model: db.Login},
            {model: db.MemberPreference},            
        ],
        where: {
            email: body.email
        },
        raw: true
    }).then(function(member) {

        bcrypt.compare(body.password, member['Login.password'], function(err, comparison) {
            if (err) {
                throw err;
            }

            if (comparison) {
                db.Login.find({
                    where: {
                        dbIndex: member.dbIndex
                    }
                }).then(function(login) {       
                    login.lastLogin = new Date();
                    login.save().then(function(saved) {
                    }).catch(function(error) {
                        console.log('Could not update user last login date.');
                    });
                });
        
                // remove login information before creating token.
                delete member['Login.password'];
        
                let token = jwt.sign(member, config.tokenSecret, {
                    expiresIn: '1h'
                });
        
                return res.json({
                    success: true,
                    token: token
                });        
            } else {
                return res.json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
        });
    });
});

//confirm account creation
accountRouter.get('/confirmAccount/:hash', function(req, res, next) {
    if (!req.params.hash) {
        return res.json({
            success: false,
            message: 'Invalid request.'
        });
    }

    db.Member.findAll({        
        include: [{
            model: db.Status,
            where: {
                confirmationHash: req.params.hash
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
        if (!status.Status.dataValues.confirmationHash || status.Status.dataValues.confirmationHash == '00000000-0000-0000-0000-000000000000') {
            res.json({
                success: false
            });
            return;
        }

        db.Status.update({
            confirmationHash: '00000000-0000-0000-0000-000000000000',
            active: true
        }, {
            where: {
                confirmationHash: status.Status.dataValues.confirmationHash
            }
        }).then(function(member) {
            res.redirect(302, '/home'); // TODO: redirect to landing page
        });
    }).catch(function(err) {
        res.json({
            success: false,
        });
    });
});

// Request a password reset for a member.
accountRouter.post('/requestReset', function(req, res, next) {
    if (!req.body.email) {
        return res.json({
            success: false,
            message: 'Missing email.'
        });
    }

    db.Member.find({        
        where: {
            email: req.body.email
        }
    }).then(function(member) {

        db.Login.find({
            where: {
                dbIndex: member.dbIndex
            }
        }).then(function(login) {
            login.resetHash = uuid();
            
            login.save().then(function(saved) {
                mailer.sendPasswordResetEmail(member, login.resetHash);
                return res.json({
                    success: true
                });
            }).catch(function(err) {
                return res.json({
                    success: false,
                });
            });
        }).catch(function(err) {
            return res.json({
                success: false,
            });
        });
    }).catch(function(err) {
        return res.json({
            success: false,
        });
    });
});

// Reset a user's password. This requires that the user has already requested
// a password reset from /requestReset, and is using the hash from the email 
// that is generated there.
accountRouter.post('/reset', function(req, res, next) {
    if (!req.body.email || !req.body.password || !req.body.hash) {
        return res.json({
            success: false,
            message: 'Invalid request.'
        });
    }

    db.Member.find({
        include: [{
            model: db.Login,
            where: {
                resetHash: req.body.hash
            }
        }],
        where: {
            email: req.body.email
        }
    }).then(function(member) {
        if (!member) {
            return res.json({
                success: false,
                message: 'Invalid request.'
            });
        }

        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
                db.Login.find({
                    where: {
                        dbIndex: member.dbIndex
                    }
                }).then(function(login) {
                    login.password = hash;
                    login.resetHash = '00000000-0000-0000-0000-000000000000';

                    login.save().then(function(saved) {
                        return res.json({
                            success: true,
                            message: 'Password reset.'
                        });
                    }).catch(function(err) {
                        return res.json({
                            success: false,
                        });
                    })
                }).catch(function(err) {
                    return res.json({
                        success: false,
                    });
                })
            });
        });
    }).catch(function(err) {
        return res.json({
            success: false,
        });
    });
});

module.exports = accountRouter;