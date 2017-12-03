var jwt = require('jsonwebtoken');
var config = require('../config/config.json');

var tokenValidator = function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Failed to authenticate.'
        });
    }

    jwt.verify(token, config.tokenSecret, function(err, decoded) {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Failed to authenticate'
            });
        }
        req.decoded = decoded;
        return next();
    });
};

module.exports = tokenValidator;