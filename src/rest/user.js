/**
 * Created by dharmendra on 30/8/16.
 */
'use strict'

var fs = require('fs'),
        config = require('config'),
        M = require('src/models'),
        moment = require('moment'),
        constant = require('src/utils/constant'),
        mail = require('src/utils/email-sender'),
        async = require('async'),
        crypto = require('crypto'),
        helper = require('src/utils/helper'),
        auth1 = require('src/utils/auth'),
        log = require('src/utils/logger')(module),
        notification = require('src/rest/notification'),
        redis = require('src/redis').getRedisInstance();

var createUserRegistration = function (corporate, cb) {
    console.log(" createUserRegistration reg ===========>", corporate);
    M.get('UserReg').create(corporate).then(function (data) {
        cb(null, data);
    }).catch(function (err) {
        console.log(err);
        cb({
            message: "Failed to  execute query at createUserRegistration"
        });
    });
}

var fetchUserByEmailId = function (emailId, cb) {
    M.get('UserReg').findOne({
        where: {email: emailId}
    }).then(function (results) {
        cb(null, results);
    }, function (err) {
        console.log(err);
        cb({
            message: "Failed to  execute query at fetchUserByEmailId"
        });
    });
}

var registration = function (req, res, next) {
    log.info("User Registration =====>", req.body);
    var token = crypto.randomBytes(16).toString('hex');
    async.parallel({
        userDate: fetchUserByEmailId.bind(M.get('UserReg'), req.body.email)
    }, function onRegistration(err, results) {
        if (results) {
            if (results.userDate) {
                console.log(results.userDate);
                if (results.userDate.status === constant.ACCOUNT_STATUS.WAIT_FOR_EMAIL_VALIDATION) {
                    log.info("Provider Registration =====> .WAIT_FOR_EMAIL_VALIDATION");
                    helper.returnTrue(req, res, constant.REG_MESSAGE.PENDING_EMAIL_VERIFICATION, {status: constant.ACCOUNT_STATUS.WAIT_FOR_EMAIL_VALIDATION});
                } else {
                    helper.returnTrue(req, res, constant.REG_MESSAGE.EMAIL_EXITS, {status: results.userDate.status});
                }
            } else {
                var CurrentDate = moment();
                CurrentDate.add(config.email.verification.expiry, 'hours');
                var expire = CurrentDate.unix();
                var profile_pic = '';
                var userReg = M.get('UserReg');
                userReg.id = '';
                userReg.email = req.body.email;
                userReg.firstName = req.body.firstName || '';
                userReg.lastName = req.body.lastName || '';
                userReg.status = constant.ACCOUNT_STATUS.WAIT_FOR_EMAIL_VALIDATION;
                userReg.updatedOn = moment().unix();
                userReg.createdOn = moment().unix();
                userReg.password = req.body.password || '';
                userReg.activation = token;
                userReg.activationExp = expire;
                // userReg.profile_pic = config.aws.s3url + config.aws.fartFolder + '/' + req.body.email + '.jpg';
                createUserRegistration(userReg, function (err, data) {
                    console.log(err);
                    if (err) {
                        helper.returnFalse(req, res, constant.REG_MESSAGE.REG_FAILED, {status: constant.ACCOUNT_STATUS.ERROR});
                    } else {
                        var html1 = config.email.activation_body;
                        html1 = html1.replace('%name%', "User");
                        html1 = html1.replace('%id%', data.id);
                        html1 = html1.replace(/%company%/gi, config.email.params.company);
                        html1 = html1.replace('%server%', config.email.params.server);
                        html1 = html1.replace('%code%', token);
                        console.log(html1);
                        mail.mailSend(req.body.email, config.email.activation_subject, '', html1, next);
                        helper.returnTrue(req, res, constant.REG_MESSAGE.EMAIL_VERIFICATION, {status: constant.ACCOUNT_STATUS.WAIT_FOR_EMAIL_VALIDATION});
                    }
                });
            }
        } else {
            helper.returnFalse(req, res, constant.REG_MESSAGE.DEVICE_REG_FAILED, {status: constant.ACCOUNT_STATUS.ERROR});
        }
    });
};

var verifyEmail = function (req, res) {
    var userReg = M.get('UserReg');
    M.get('UserReg').findOne({
        where: {id: req.query.id}
    })
            .then(function (results) {
                var activation_code = req.query.c;
                var time = moment().unix();
                if (results.activation == activation_code) {
                    if (time < results.activationExp) {
                        var userReg = M.get('UserReg');
                        userReg.update(
                                {
                                    activation: "",
                                    activationExp: "0",
                                    status: constant.ACCOUNT_STATUS.ACTIVE
                                },
                                {
                                    where: {id: req.query.id}
                                }).then(function (user) {
                            res.status(200).send(constant.REG_MESSAGE.ACC_ACTIVATE);
                        });
                    } else {
                        var CurrentDate = moment();
                        var token = crypto.randomBytes(16).toString('hex');
                        CurrentDate.add(config.email.verification.expiry, 'hours');
                        var expire = CurrentDate.unix();

                        var html1 = config.email.activation_body;
                        html1 = html1.replace('%name%', userReg.first_name + " " + userReg.last_name);
                        html1 = html1.replace('%id%', user.id);
                        html1 = html1.replace(/%company%/gi, config.email.params.company);
                        html1 = html1.replace('%server%', config.email.params.server);
                        html1 = html1.replace('%code%', token);

                        mail.mailSend(req.body.email, config.email.activation.subject, '', html1, next);
                        var userReg = M.get('UserReg');
                        userReg.update(
                                {
                                    activation: token,
                                    activationExp: expire
                                },
                                {
                                    where: {id: req.query.id}
                                }).then(function (user) {
                            res.status(200).send(constant.REG_MESSAGE.ACC_SEND_ACTIVATION_AGAIN);
                        });

                    }
                } else {
                    res.status(200).send(constant.REG_MESSAGE.ACC_ACTIVATE_LOGIN);
                }
            }, function (err) {
                helper.returnFalse(req, res, constant.REG_MESSAGE.ACC_VERIFICATION_FAILED, {status: constant.ACCOUNT_STATUS.ERROR});
            });
};

var fetchProfile = function (req, res) {
    // var user = req.user;
    var payload = auth1.decodeToken(req.headers.authorization.split(' ')[1]);
    var userEmail = payload.user;
    var email = req.body.email;
    if (email) {
        userEmail = email;
    }

    async.parallel({
        // notification: notification.register.bind(null, req, res),
        user: fetchUserByEmailId.bind(M.get('UserReg'), userEmail)

                // challengesCount: M.get('LeaderBoard').fetchUserChallengeCount.bind(M.get('LeaderBoard'), userEmail)
    }, function onRegistration(err, results) {
        if (results.user) {
            results.user.password = '';
            var profile = {
                "user": results.user,
            };

            var array = {
                "profile": profile
            };
            helper.returnTrue(req, res, '', array);
        } else {
            helper.returnTrue(req, res, '', {});
        }
    });


};


var updateProfile = function (req, res) {
    var payload = auth1.decodeToken(req.headers.authorization.split(' ')[1]);
    var id = payload.id;
    var updateTime = moment().unix();
    M.get('UserReg').findOne({
        where: {id: id}
    }).then(function onUserFetch(user) {
        var userReg = {};
        userReg.firstName = req.body.firstName || user.firstName;
        userReg.lastName = req.body.lastName || user.lastName;
        userReg.updatedOn = moment().unix();
        userReg.password = req.body.password || '';
        M.get('UserReg').update(
                userReg,
                {
                    where: {id: id}
                }).then(function (newuser) {
            helper.returnTrue(req, res, constant.REG_MESSAGE.PROFILE_UPDATED, {});
        }, function (err) {
            helper.returnFalse(req, res, constant.ERROR.UNABLE_TO_UPDATE, {});
        });
    }, function (err) {
        helper.returnFalse(req, res, constant.ERROR.UNABLE_TO_UPDATE, {});
    });
};


var registrationFacebook = function (req, res, next) {
    log.info("User Registration =====>", req.body);
    var token;
    async.parallel({
        userData: fetchUserByEmailId.bind(M.get('UserReg'), req.body.email)
    }, function onRegistration(err, results) {
        if (results) {
            if (results.userData) {
                M.get('UserReg').update(
                        {
                            status: constant.ACCOUNT_STATUS.ACTIVE
                        },
                        {
                            where: {email: results.userData.email}
                        }).then(function (newuser) {
                    token = auth1.createJWT({
                        id: results.userData.id,
                        user: results.userData.email
                    });
                    redis.addToken(results.userData.id, token, function (err, reply) {
                        if (err) {
                            log.info('Token not updated in redis for user ', results.userData.id);
                        } else {
                            log.info('Token updated in redis for user ', results.userData.id);
                        }
                    });
                    notification.register(req, res, function () {
                    })
                    helper.returnTrue(req, res, constant.REG_MESSAGE.SUCCESSFUL, {
                        status: constant.ACCOUNT_STATUS.ACTIVE,
                        token: token
                    });
                }, function (err) {
                    helper.returnFalse(req, res, constant.ERROR.UNABLE_TO_UPDATE, {});
                });

            } else {
                var CurrentDate = moment();
                CurrentDate.add(config.email.verification.expiry, 'hours');
                var expire = CurrentDate.unix();
                var profile_pic = '';
                var userReg = M.get('UserReg');
                userReg.id = '';
                userReg.email = req.body.email;
                userReg.firstName = req.body.first_name;
                userReg.lastName = req.body.last_name || '';
                userReg.status = constant.ACCOUNT_STATUS.ACTIVE;
                userReg.updatedOn = moment().unix();
                userReg.createdOn = moment().unix();
//                userReg.activation = token;
                // userReg.profile_pic = config.aws.s3url + config.aws.fartFolder + '/' + req.body.email + '.jpg';
                userReg.score = 0;
                createUserRegistration(userReg, function (err, data) {
                    if (err) {
                        helper.returnFalse(req, res, constant.REG_MESSAGE.REG_FAILED, {status: constant.ACCOUNT_STATUS.ERROR});
                    }
                    token = auth1.createJWT({
                        id: data.ID,
                        user: data.email
                    });
                    redis.addToken(data.ID, token, function (err, reply) {
                        if (err) {
                            log.info('Token not updated in redis for user ', data.id);
                        } else {
                            log.info('Token updated in redis for user ', data.id);
                        }
                    });
//                    notification.register(req, res, function () {
//                    })
                    helper.returnTrue(req, res, constant.REG_MESSAGE.SUCCESSFUL, {
                        status: data.status,
                        token: token
                    });
                });
            }
        } else {
            helper.returnFalse(req, res, constant.REG_MESSAGE.DEVICE_REG_FAILED, {status: constant.ACCOUNT_STATUS.ERROR});
        }
    });
};



var provider = {
    registration: registration,
    registrationFacebook: registrationFacebook,
    verifyEmail: verifyEmail,
    updateProfile: updateProfile,
    fetchProfile : fetchProfile
};

module.exports = provider;