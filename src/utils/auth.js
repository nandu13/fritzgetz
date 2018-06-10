/**
 * Created by dharmendra
 */

require('rootpath')();
var config = require('config'),
    debug = require('debug')('src.helpers.auth'),
    moment = require('moment'),
    log = require('src/utils/logger')(module),
    jwt = require('jwt-simple');
    redis = require('src/redis').getRedisInstance();

var auth = {
    decodeToken: function (authorization) {
        log.info('authorization', authorization);
        try {
            var payload = jwt.decode(authorization, config.token.secret);
            log.info('payload', payload);
            return payload;
        }
        catch (err) {
            log.info('payload', err);
            return null;
        }
    },
    createJWT: function (user) {
        console.log('token === ',user);
        var payload = {
            user: user.user,
            id: user.id,
            type : user.type,
            name : user.name
        };
        debug('--->JWT Payload - ', payload);
        return jwt.encode(payload, config.token.secret);
    },
    ensureAuthenticated: function (req, res, next) {
        if (!req.headers.authorization) {
            log.error('--->token not present');
            return res.status(401).send({message: 'Please make sure your request has an Authorization header'});
        }
        log.info('token value ', req.headers.authorization.split(' ').length);
        var tokenDetail;
        if (tokenDetail = req.headers.authorization.split(' ').length !== 2) {
            log.error('--->Invalid token');
            return res.status(401).json({message: "Invalid token 1"});
        }
        log.info('token value ', tokenDetail);
        var payload = auth.decodeToken( req.headers.authorization.split(' ')[1]);
        log.info('payload ',payload);
        if (payload) {
            var token = redis.getToken(payload.id, function (err, token) {
                log.info('redis token ',token);
                if (token) {
                    if (token.toString() == req.headers.authorization.split(' ')[1]) {
                        req.user = payload;
                        return next();
                    } else
                        return res.status(401).json({message: "Invalid token"});
                } else {
                    return res.status(401).json({message: "Invalid token"});
                }
            });
        } else {
            return res.status(401).json({message: "Invalid token"});
        }

    }
};

module.exports = auth;