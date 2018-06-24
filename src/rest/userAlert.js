'use strict'
var fs = require('fs'),
        config = require('config'),
        log = require('src/utils/logger')(module),
        helper = require('src/utils/helper'),
        M = require('src/models'),
        moment = require('moment'),
        async = require('async'),
        job = require('src/schedular/price-alert');


var createUserAlter = function (req, res, next) {
    var user = req.user;

    async.waterfall([
        _createUserAlter.bind(null, user, req.body), //Check user if challenge already complete
        _fetchPriceAndNotificationSend.bind(null)
    ], function (err) {
        log.info('=>err', err);
        if (err) {
            helper.returnFalse(req, res, err.message, {});
        } else
            helper.returnTrue(req, res, 'Success', {});
    });
};

var _fetchPriceAndNotificationSend = function (userAlert, next) {
    job.excuteUserAlter(userAlert, function (err) {
        console.log(" _fetchPriceAndNotificationSend == >", err);
        next();
    });
};

var createUrl = function (body) {

    var productUrl;
    if (body && body.url) {
        productUrl = body.url;
    }

    switch (body.webSite) {
        case 'ASOS':
            productUrl = body.url;
            break;
        case 'Zalando':
            productUrl = body.url;
            break;
        case 'Topshop':
            productUrl = body.url;
            break;
        case 'H&M':
            productUrl = body.url;
            break;
        case 'ESPRIT':
            productUrl = body.url;
            break;
        case 'COSSTORES':
            productUrl = body.url;
            break;
        case 'SHOP.MANGO':
            productUrl = body.url;
            break;
        case 'BREUNINGER':
            productUrl = body.url;
            break;
        case 'NET A PORTER':
            productUrl = body.url;
            break;
        case 'UNIQLO':
            productUrl = body.url;
            break;
    }

    console.log("productUrl  ", productUrl)
    return productUrl;
}

var _createUserAlter = function (user, body, next) {
    console.log(" log email ", user)
    var email = user.user;
    console.log(" log email ", email)
    var userAlert = {};
    userAlert.id = '';
    userAlert.email = email || '';
    userAlert.url = createUrl(body) || '';
    userAlert.articalNumber = body.articalNumber || '';
    userAlert.webSite = body.webSite || '';
    userAlert.status = 1;
    userAlert.createdOn = moment().unix();
    userAlert.updatedOn = moment().unix();

    console.log("User Alert ", JSON.stringify(userAlert))
    M.get('UserAlter').create(userAlert).then(function (data) {
        next(null, data);
    }).catch(function (err) {
        console.log(err);
        next({
            message: "Failed to  execute query at create userAlert"
        });
    });
};



function arrayMax(arr) {
    var len = arr.length, max = -Infinity;
    while (len--) {
        if (arr[len] > max) {
            max = arr[len];
        }
    }
    return max;
}
;



var getUserAlter = function (req, res, next) {
    var email = req.user.user;

    M.get('UserAlter').findAll({
        where: {
            email: email
        },
        order: [
            ['createdOn', 'DESC']
        ]
    }).then(function (data) {
        helper.returnTrue(req, res, 'Success', data);
    }).catch(function (err) {
        console.log(err);
        helper.returnFalse(req, res, err.message, {});
    });
};

var updateUserAlter = function (req, res, next) {
    var user = req.user;
    var id = req.body.alter_id;

    async.waterfall([
        _findUserAlter.bind(null, user.email, id, req.body),
        _updateUserAlter.bind(null, req.body), //Check user if challenge already complete
//        _updateChallenge.bind(null, user, score, url),
//       _sendUserNotification.bind(null, obj, message),
    ], function (err) {
        log.info('=>err', err);
        if (err) {
            helper.returnFalse(req, res, err.message, {});
        } else
            helper.returnTrue(req, res, 'Success', {});
    });
};

var _findUserAlter = function (emailId, id, next) {
    M.get('UserAlter').findOne({
        where: {email: emailId,
            id: id}
    }).then(function (results) {
        if (results) {
            next(null, results);
        } else {
            next({
                message: "User Alter not exits"
            });
        }
    }, function (err) {
        console.log(err);
        next({
            message: "Failed to  execute query at fetchUserByEmailId"
        });
    });
}

var _updateUserAlter = function (body, user, next) {

    var userAlter = {};

    userAlter.email = user.email;
    userAlter.url = body.url || user.url;
    userAlert.articalNumber = body.articalNumber || user.articalNumber;
    userAlert.webSite = body.webSite || user.webSite;
    userAlert.status = body.status || user.status;
    userAlert.updatedOn = moment().unix();
    M.get('UserAlter').update(userAlert,
            {
                where: {
                    id: user.id
                }
            }).then(function (data) {
        next(null, data);
    }).catch(function (err) {
        console.log(err);
        next({
            message: "Failed to  execute query at create userAlert"
        });
    });
};


var getUserAlterPrice = function (req, res, next) {
    var email = req.user.user;
    var alertId = req.params.id;
    
    console.log(req.params.id);
    
    

    M.get('AlterPrice').findAll({
        where: {
            email: email,
            alertId:alertId
        },
        order: [
            ['createdOn', 'DESC']
        ]
    }).then(function (data) {
        helper.returnTrue(req, res, 'Success', data);
    }).catch(function (err) {
        console.log(err);
        helper.returnFalse(req, res, err.message, {});
    });
};

var userAlert = {
    createUserAlter: createUserAlter,
    getUserAlert: getUserAlter,
    updateUserAlter: updateUserAlter,
    getUserAlterPrice: getUserAlterPrice
}
module.exports = userAlert;
