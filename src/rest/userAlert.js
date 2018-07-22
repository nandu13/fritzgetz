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
        _createUserAlter.bind(null, req), //Check user if challenge already complete
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
    job.excuteUserAlter(userAlert, function (err, data) {
        console.log(" _fetchPriceAndNotificationSend == >", err);
        next(null, data);
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

var _createUserAlter = function (req, next) {
    console.log(" log email ", req.user.id);
    var email = req.user.id;
    console.log(" log email ", email);
    var clientIp = (req.headers["X-Forwarded-For"] ||req.headers["x-forwarded-for"] ||'').split(',')[0] ||
           req.client.remoteAddress;
    var userAlert = {};
    userAlert.id = '';
    userAlert.AddedByUserID = email || '';
    userAlert.url = createUrl(req.body) || '';
    userAlert.WebsiteID = req.body.webSiteID || '';
    userAlert.website = req.body.webSite || '';
    userAlert.status = 1;
    userAlert.createdOn =  moment().utc().format('YYYY-MM-DD HH:mm:ss');
    userAlert.lastCheckedDate =  moment().utc().format('YYYY-MM-DD HH:mm:ss');
    userAlert.updatedOn =  moment().utc().format('YYYY-MM-DD HH:mm:ss');
    userAlert.CreatedByIP = clientIp || '';
    userAlert.LastUpdatedByIP =clientIp ||'';

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
    var userEmail = req.user.id;
    var email = req.query.email;
    if (email) {
        userEmail = email;
    }
    M.get('UserAlter').findAll({
        where: {
            AddedByUserID : userEmail,
            status : {
                 $ne : 5
            }
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
    
    var userEmail = req.user.id;
    var email = req.body.email;
    if (email) {
        userEmail = email;
    }
    var id = req.body.alert_id;

    async.waterfall([
        _findUserAlter.bind(null, userEmail, id),
        _updateUserAlter.bind(null, req), //Check user if challenge already complete
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
    console.log(" id ",id)
    M.get('UserAlter').findOne({
        where: {
            AddedByUserID: emailId,
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

var _updateUserAlter = function (req, user, next) {

    var userAlter = {};
    
    var email = user.id;
    console.log(" log email ", email);
    var clientIp = (req.headers["X-Forwarded-For"] ||req.headers["x-forwarded-for"] ||'').split(',')[0] ||
           req.client.remoteAddress;
    var userAlert = {};
//    userAlert.id = '';
//    userAlert.AddedByUserID = email || '';
    userAlert.url = req.body.url || user.url;
    userAlert.WebsiteID = req.body.webSiteID || user.WebsiteID;
//    userAlert.website = req.body.webSite || user.webSite;
    userAlert.status = req.body.status || user.status;
//    userAlert.createdOn =  moment().utc().format('YYYY-MM-DD HH:mm:ss');
    userAlert.lastCheckedDate =  moment().utc().format('YYYY-MM-DD HH:mm:ss');
    userAlert.updatedOn =  moment().utc().format('YYYY-MM-DD HH:mm:ss');
//    userAlert.CreatedByIP = clientIp || '';
    userAlert.LastUpdatedByIP =clientIp ||'';

 
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
    var email = req.user.id;
    var alertId = req.params.id;

    console.log(req.params.id);



    M.get('AlterPrice').findAll({
        where: {
            
            alertId: alertId
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

var _getFetchAlterPrice = function (email, alertId, next) {
    M.get('UserAlter').findOne({
        where: {
            AddedByUserID: email,
            id: alertId
        }
    }).then(function (data) {
        if (data) {
            next(null, data);
        } else {
            next({
                message: "Alert does not exits for this user"
            });
        }
    }).catch(function (err) {
        console.log(err);
        next({
            message: "Alert does not exits for this user"
        });
    });
};

var fetchCurrentPrice = function (req, res, next) {
    var email = req.user.id;
    var alertId = req.params.id;

    async.waterfall([
        _getFetchAlterPrice.bind(null, email, alertId), //Check user if challenge already complete
        _fetchPriceAndNotificationSend.bind(null)
    ], function (err, price) {
        log.info('=>err', err);
        if (err) {
            helper.returnFalse(req, res, err.message, {});
        } else
            helper.returnTrue(req, res, 'Success', {price: price});
    });
};

var userAlert = {
    createUserAlter: createUserAlter,
    getUserAlert: getUserAlter,
    updateUserAlter: updateUserAlter,
    getUserAlterPrice: getUserAlterPrice,
    fetchCurrentPrice: fetchCurrentPrice
}
module.exports = userAlert;
