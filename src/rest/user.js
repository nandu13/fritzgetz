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
                userReg.password = req.body.password||'';
                userReg.activation = token;
                userReg.activationExp = expire;
                // userReg.profile_pic = config.aws.s3url + config.aws.fartFolder + '/' + req.body.email + '.jpg';
                createUserRegistration(userReg, function (err, data) {
                    console.log(err);
                    if (err) {
                        helper.returnFalse(req, res, constant.REG_MESSAGE.REG_FAILED, {status: constant.ACCOUNT_STATUS.ERROR});
                    }else{
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
        user: M.get('UserReg').fetchUserByEmailId.bind(M.get('UserReg'), userEmail),
        totalChallenges: M.get('UserChallenges').totalChallengesCount.bind(M.get('UserChallenges'), userEmail),
        winChallenges: M.get('UserChallenges').winningChallengesCount.bind(M.get('UserChallenges'), userEmail),
        level: M.get('Level').fetchAllLevel.bind(M.get('Level')),

        // challengesCount: M.get('LeaderBoard').fetchUserChallengeCount.bind(M.get('LeaderBoard'), userEmail)
    }, function onRegistration(err, results) {
        var profile, achievement = [], totalCount = 0, winCount = 0, level = [];
        if (results.user) {
            results.user.password = '';
            profile = {
                "user": results.user,
            };
            if (results.winChallenges)
                for (var i = 0; i < results.winChallenges.length; i++) {
                    winCount = winCount + parseInt(results.winChallenges[i].totalwinning ? results.winChallenges[i].totalwinning : 0)
                    achievement.push({
                        // "logo": results.challengesCount[i].icon_image_url,
                        "lb": results.winChallenges[i].fart_type,
                        "count": results.winChallenges[i].totalwinning ? results.winChallenges[i].totalwinning : 0,
                        // "id": results.challengesCount[i].tid
                    });

                    /* if (results.challengesCount[i].tid === 9 || results.challengesCount[i].tid === 10) {
                     combatCount = combatCount + parseInt(results.challengesCount[i].winchallenges ? results.challengesCount[i].winchallenges : 0)
                     } else {
                     clashCount = clashCount + parseInt(results.challengesCount[i].winchallenges ? results.challengesCount[i].winchallenges : 0)
                     }*/
                }

            if (results.level) {
                // var totalWon = results.challengesCount[0] ? results.challengesCount[0].winchallenges : 0;
                var newLevel = [];
                for (var i = 0; i < results.level.length; i++) {
                    var image = results.level[i].defalut_image;
                    if (winCount >= results.level[i].start_range) {
                        image = results.level[i].achieve_image;
                    }
                    newLevel.push({
                        "logo": image,
                        "lb": results.level[i].level_name,
                        "description": results.level[i].describtion,
                        "hash_code": results.level[i].hash_code
                    })
                }
                level = newLevel;
            }
            var array = {
                "profile": profile,
                "total_challenge": results.totalChallenges ? (results.totalChallenges[0] ? results.totalChallenges[0].totalchallenges : 0) : 0,
                "winning_challenge": winCount,
                "achievement": level
            };
            helper.returnTrue(req, res, '', array);
        } else {
            helper.returnTrue(req, res, '', {});
        }
    });


};

var fetchProfileByID = function (req, res) {
    var id = req.body.id;
    if (id === '') {
        helper.returnFalse(req, res, constant.ERROR.UNABLE_TO_FETCH, {});
    }
    M.get('UserReg').findOne({
        where: {id: id}
    }).then(function onUserFetch(user) {
        if (user === null) {
            helper.returnFalse(req, res, constant.ERROR.UNABLE_TO_FETCH, {});
        }
        user.credits = 0;
        var array = {
            "profile": {
                "background": config.email.params.serverImg + "images/Profile_BG.jpg",
                "user": user,
                "creditCap": config.credits.creditCap
            },
            "challanges": {
                "total": 10,
                "won": 5
            },
            "achievements": [
                {
                    "logo": config.email.params.serverImg + "images/warrior-icon.png",
                    "lb": "Warrior"
                },
                {
                    "logo": config.email.params.serverImg + "images/gladiator-icon.png",
                    "lb": "Gladiator"
                }
            ]
        };
        helper.returnTrue(req, res, '', array);
    });
};

var updateProfile = function (req, res) {
    var payload = auth1.decodeToken(req.headers.authorization.split(' ')[1]);
    var id = payload.id;
    var updateTime = moment().unix();
    M.get('UserReg').findOne({
        where: {id: id}
    }).then(function onUserFetch(user) {
        var userReg = M.get('UserReg');
        userReg.update(
                {
                    email: req.body.email,
                    first_name: req.body.first_name,
                    last_name: req.body.last_name || '',
                    nick_name: req.body.nick_name || '',
                    dob: req.body.dob || '',
                    gender: req.body.gender || '',
                    updated: moment().unix(),
                    city: req.body.city || '',
                    country: 'GBR',
                    mobile: req.body.mobile || '',
                    password: req.body.password || ''
                },
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

var searchContacts = function (req, res) {
    var text = req.body.searchEmail;
    M.get('UserReg').findAll({
        where: {
            $or: [{first_name: {$like: text + '%'}}, {last_name: {$like: text + '%'}}, {email: {$like: text + '%'}}],
            status: constant.ACCOUNT_STATUS.ACTIVE
        },
        attributes: ['id', 'email', ['first_name', 'fname'], ['last_name', 'lname'], ['nick_name', 'nick']]
    }).then(function onMessageSearch(results) {
        helper.returnTrue(req, res, '', results);
    }, function (err) {
        helper.returnFalse(req, res, constant.ERROR.UNABLE_TO_FETCH, {});
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
                userReg.activation = token;
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

var updatePic = function (req, res) {
    var payload = auth1.decodeToken(req.headers.authorization.split(' ')[1]);
    var id = payload.id;
    M.get('UserReg').findOne({
        where: {id: id}
    }).then(function onUserFetch(user) {
        var userReg = M.get('UserReg');
        userReg.update(
                {
                    profile_pic: config.aws.s3url + config.aws.fartFolder + '/' + payload.user + '.jpg',
                    updated: moment().unix()

                },
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

var provider = {
    registration: registration,
    registrationFacebook: registrationFacebook,
    verifyEmail: verifyEmail
};

module.exports = provider;