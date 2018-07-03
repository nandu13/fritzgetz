'use strict';
var fs = require('fs'),
        config = require('config'),
        log = require('src/utils/logger')(module),
        constant = require('src/utils/constant'),
        helper = require('src/utils/helper'),
        mail = require('src/utils/email-sender'),
        M = require('src/models'),
        async = require('async'),
        notification = require('src/rest/notification'),
        auth1 = require('src/utils/auth'),
        redis = require('src/redis').getRedisInstance();


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
var fetchAdminByEmailId = function (emailId, cb) {
    M.get('admin').findOne({
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

var login = function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    async.parallel({
        //notification: notification.register.bind(null, req, res),
        userData: fetchUserByEmailId.bind(M.get('UserReg'), email)
    }, function (err, results) {
        var token = '';
        if (err) {
            helper.returnFalse(req, res, constant.ERROR.LOGIN_FAILED_SERVER, {
                status: constant.ACCOUNT_STATUS.ERROR,
                token: token
            });
        } else if (results && results.userData) {
            if (password === results.userData.password) {
                if (results.userData.status === constant.ACCOUNT_STATUS.WAIT_FOR_EMAIL_VALIDATION) {
                    helper.returnTrue(req, res, constant.REG_MESSAGE.PENDING_EMAIL_VERIFICATION, {
                        status: results.userData.status,
                        token: token
                    });
                } else if (results.userData.status === constant.ACCOUNT_STATUS.ACTIVE) {
                    token = auth1.createJWT({
                        id: results.userData.id,
                        user: results.userData.email,
                        name: results.userData.firstName + ' ' + results.userData.lastName
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
                        status: results.userData.status,
                        token: token,
                        profile: results
                    });
                } else if (results.userData.status === constant.ACCOUNT_STATUS.SUSPENDED) {
                    helper.returnTrue(req, res, constant.REG_MESSAGE.ACC_SUSPENDED, {
                        status: results.userData.status,
                        token: token,
                        profile: results
                    });
                } else if (results.userData.status === constant.ACCOUNT_STATUS.DELETED) {
                    helper.returnTrue(req, res, constant.REG_MESSAGE.ACC_DELETED, {
                        status: results.userData.status,
                        token: token,
                        profile: results
                    });
                }
            } else {
                helper.returnFalse(req, res, constant.REG_MESSAGE.PASSWORD_NOT_MATCH, {
                    status: results.userData.status,
                    token: token,
                    profile: results
                });
            }
        } else {
            helper.returnFalse(req, res, constant.REG_MESSAGE.USER_NOT_EXIT, {
                status: constant.ACCOUNT_STATUS.ERROR,
                token: token
            });
        }

    });
};



var loginTemp = function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    var token = "";
    var table = "";
    if (req.body.user_type === 'Provider') {
        table = "ProviderReg";
    } else {
        table = "CustomerReg";
    }
    async.parallel({
        userData: M.get(table).fetchUserByEmailId.bind(M.get(table), email)
    }, function (err, results) {
        if (err) {
            helper.returnFalse(req, res, "ERROR", {"Error": err});
        }
        if (results && results.userData) {
            if (password === results.userData.password) {
                if (results.userData.status === constant.ACCOUNT_STATUS.ACTIVE) {
                    token = auth1.createJWT({
                        id: results.userData.id,
                        type: req.body.user_type,
                        user: results.userData.email
                    });
                    redis.addToken(results.userData.id, token, function (err, reply) {
                        if (err) {
                            log.info('Token not updated in redis for user ', results.userData.id);
                        } else {
                            helper.returnTrue(req, res, constant.REG_MESSAGE.SUCCESSFUL, {
                                token: token
                            });
                        }
                    });
                } else {
                    helper.returnFalse(req, res, "ERROR", {"Error": constant.ERROR.ACCOUNT_NOT_ACTIVE});
                }
            }
        } else {
            helper.returnFalse(req, res, "Password not match", {});
        }
    });
};

var forgotPassword = function (req, res, next) {
    var email = req.body.email;
    M.get('UserReg').findOne({
        where: {email: email}
    }).then(function (result) {
        if (result) {
            var html1 = config.email.forgot_body;
            html1 = html1.replace('%name%', result.first_name + " " + result.last_name);
            html1 = html1.replace('%email%', result.email);
            html1 = html1.replace(/%company%/gi, config.email.params.company);
            html1 = html1.replace('%password%', result.password);
            mail.mailSend(result.email, config.email.forgot_subject, '', html1, next);
            helper.returnTrue(req, res, constant.FORGOT.EMAIL_FORGOT_PASSWORD, {status: result.status});
        } else {
            helper.returnFalse(req, res, constant.ERROR.EMAIL_NOT_EXISTS, {
                status: constant.ACCOUNT_STATUS.ERROR
            });
        }
    });
};

var adminForgotPassword = function (req, res, next) {
    var email = req.body.email;
    M.get('admin').findOne({
        where: {email: email}
    }).then(function (result) {
        if (result) {
            var html1 = config.email.forgot_body;
            html1 = html1.replace('%name%', result.first_name + " " + result.last_name);
            html1 = html1.replace('%email%', result.email);
            html1 = html1.replace(/%company%/gi, config.email.params.company);
            html1 = html1.replace('%password%', result.password);
            mail.mailSend(result.email, config.email.forgot_subject, '', html1, next);
            helper.returnTrue(req, res, constant.FORGOT.EMAIL_FORGOT_PASSWORD, {status: result.status});
        } else {
            helper.returnFalse(req, res, constant.ERROR.EMAIL_NOT_EXISTS, {
                status: constant.ACCOUNT_STATUS.ERROR
            });
        }
    });
};

var adminLogin = function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    async.parallel({
        //notification: notification.register.bind(null, req, res),
        userData: fetchAdminByEmailId.bind(M.get('admin'), email)
    }, function (err, results) {
        var token = '';
        if (err) {
            helper.returnFalse(req, res, constant.ERROR.LOGIN_FAILED_SERVER, {
                status: constant.ACCOUNT_STATUS.ERROR,
                token: token
            });
        } else if (results && results.userData) {
            if (password === results.userData.password) {
                if (results.userData.status === constant.ACCOUNT_STATUS.WAIT_FOR_EMAIL_VALIDATION) {
                    helper.returnTrue(req, res, constant.REG_MESSAGE.PENDING_EMAIL_VERIFICATION, {
                        status: results.userData.status,
                        token: token
                    });
                } else if (results.userData.status === constant.ACCOUNT_STATUS.ACTIVE) {
                    token = auth1.createJWT({
                        id: results.userData.id,
                        user: results.userData.email,
                        name: results.userData.firstName + ' ' + results.userData.lastName,
                        role: 'admin'
                    });
                    redis.addToken(results.userData.id, token, function (err, reply) {
                        if (err) {
                            log.info('Token not updated in redis for user ', results.userData.id);
                        } else {
                            log.info('Token updated in redis for user ', results.userData.id);
                        }
                    });
//                    notification.register(req, res, function () {
//                    })
                    helper.returnTrue(req, res, constant.REG_MESSAGE.SUCCESSFUL, {
                        status: results.userData.status,
                        token: token
                    });
                } else if (results.userData.status === constant.ACCOUNT_STATUS.SUSPENDED) {
                    helper.returnTrue(req, res, constant.REG_MESSAGE.ACC_SUSPENDED, {
                        status: results.userData.status,
                        token: token
                    });
                } else if (results.userData.status === constant.ACCOUNT_STATUS.DELETED) {
                    helper.returnTrue(req, res, constant.REG_MESSAGE.ACC_DELETED, {
                        status: results.userData.status,
                        token: token
                    });
                }
            } else {
                helper.returnFalse(req, res, constant.REG_MESSAGE.PASSWORD_NOT_MATCH, {
                    status: results.userData.status,
                    token: token
                });
            }
        } else {
            helper.returnFalse(req, res, constant.REG_MESSAGE.USER_NOT_EXIT, {
                status: constant.ACCOUNT_STATUS.ERROR,
                token: token
            });
        }

    });
};

var auth = {
    login: login,
    adminLogin: adminLogin,
    adminForgotPassword: adminForgotPassword,
    forgotPassword: forgotPassword,
    loginTemp: loginTemp
};

module.exports = auth;