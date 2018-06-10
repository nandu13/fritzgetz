'use strict';
var express = require('express'),
    bodyParser = require('body-parser'),
    router = express.Router(),
    auth = require('src/rest/auth'),
    user = require('src/rest/user'),
    helper = require('src/utils/helper'),
    auth1 = require('src/utils/auth');
  


var BASE_URL = '/rest/';
/*
 * Routes that can be accessed by any one
 */
router.post(BASE_URL + 'o/v1/user/registration', user.registration);
router.post(BASE_URL + 'o/v1/user/other/registration', user.registrationFacebook);
router.post(BASE_URL + 'o/v1/login', auth.login);
//Email verify
router.get(BASE_URL + 'o/v1/emailVerify', user.verifyEmail);
//Forgot password
router.post(BASE_URL + 'o/v1/forgotPassword', auth.forgotPassword);

module.exports = function (app) {
    app
    //.use(require('morgan')('combined', {"stream": logger.stream}))
        .use(bodyParser.json({limit: '5mb'}))
        .all('/*', function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Credentials', true);
            res.header('Authorization', true);
            // Set custom headers for CORS
            res.header('Access-Control-Allow-Headers', 'Content-type,X-Requested-With,Accept, Authorization');
            req.headers['content-type'] = req.headers['content-type'] || 'application/json';
            if (req.method == 'OPTIONS') {
                res.status(200).end();
            } else {
                next();
            }
        })
        .all(BASE_URL + 'v1/*', [auth1.ensureAuthenticated])
        .use(bodyParser.urlencoded({extended: false}));

    return router;
};
