'use strict';

var config = require('config'),
        _ = require('lodash'),
        moment = require('moment'),
        debug = require('debug')('src.rest.notification'),
        async = require('async');

var log = require('src/utils/logger')(module),
        C = require('src/utils/constant'),
        notification = require('src/utils/notification'),
        M = require('src/models'),
        helper = require('src/utils/helper');


var send = function (req, res) {
    notification._notifyUser(req.body.email, req.body.message, C.NOTIFICATION.TYPE_BUSINESS, null, function (err, data) {
        if (err) {
            return res.status(500).json(err);
        }
        res.status(200).json(data);
    });
    // }
}

//Register for SNS
var register = function (req, res, next) {
    var user = req.body.email;
    var deviceToken = req.body.deviceToken;
    var platform = (req.body.platform || '').toLowerCase();
    if (!platform) {
        platform = C.PLATFORM.ANDROID;
    }
    var epoc = moment().unix();
    M.get('UserReg').update(
            {
                deviceToken: deviceToken,
                updatedOn: epoc,
                platform: platform
            }, {
        where: {
            email: user
        }
    }).then(function (data) {

        return next ? next(null, data) : next;
    }, function (err) {
        log.error('=>insert', err);
        return next ? next({message: err.message ? err.message : err.toString()}) : next;
    });

}

var notificationRoute = {
    send: send,
    register: register
            // _notifyUser :_notifyUser
};

module.exports = notificationRoute;

