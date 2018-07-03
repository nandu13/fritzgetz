'use strict';
var express = require('express'),
        bodyParser = require('body-parser'),
        router = express.Router(),
        auth = require('src/rest/auth'),
        user = require('src/rest/user'),
        admin = require('src/rest/admin'),
        userAlert = require('src/rest/userAlert'),
        helper = require('src/utils/helper'),
        auth1 = require('src/utils/auth'),
        website = require('src/rest/website');



var BASE_URL = '/rest/';
/*
 * Routes that can be accessed by any one
 */
router.post(BASE_URL + 'o/v1/user/registration', user.registration);
router.post(BASE_URL + 'o/v1/user/other/registration', user.registrationFacebook);
router.post(BASE_URL + 'o/v1/login', auth.login);
router.get(BASE_URL + 'v1/user/profile', user.fetchProfile);
router.patch(BASE_URL + 'v1/user/profile', user.updateProfile);

router.get(BASE_URL + 'v1/website', website.getWebsites);

router.post(BASE_URL + 'v1/user/alert', userAlert.createUserAlter);
router.get(BASE_URL + 'v1/user/alert', userAlert.getUserAlert);
router.get(BASE_URL + 'v1/user/alert/:id/price', userAlert.getUserAlterPrice);
router.patch(BASE_URL + 'v1/user/alert', userAlert.updateUserAlter);

router.post(BASE_URL + 'v1/current/:id/price', userAlert.fetchCurrentPrice);

router.post(BASE_URL + 'o/v1/admin/registration', admin.registration);
router.post(BASE_URL + 'o/v1/admin/login', auth.adminLogin);
router.get(BASE_URL + 'o/v1/admin/emailVerify', admin.verifyEmail);
router.post(BASE_URL + 'o/v1/admin/forgotPassword', auth.adminForgotPassword);
router.get(BASE_URL + 'v1/admin/profile', admin.fetchProfile);
router.patch(BASE_URL + 'v1/admin/profile', admin.updateProfile);

router.get(BASE_URL + 'v1/all/user/profile', admin.allUserProfile);

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
                res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
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
