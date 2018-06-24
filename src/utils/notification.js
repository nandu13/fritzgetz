'use strict';

var config = require('config'),
        _ = require('lodash'),
        moment = require('moment'),
        debug = require('debug')('app.helpers.notification'),
        async = require('async'),
        M = require('src/models');
var request = require('request');


// send mail with defined transport object
var notificationSend = function (email, message, cb) {
    M.get('UserReg').findOne(
            {where: {
                    email: email
                }}).then(function (data) {
        if (data) {
            if (data.deviceToken) {
                var body = {};
                body.to = data.deviceToken;
                body.notification = {
                    body: message
                };
                request({
                    url: 'https://fcm.googleapis.com/fcm/send',
                    method: 'POST',
                    json: true,
                    headers: {
                        "Authorization": "key=AAAAstcuFus:APA91bHIXGLrORm0mwXiuN6RsjAXXAKGCsRM3JzoVceE8OCBcuB88lPiuCvwS5UVof_lqUAmFTxYS-qTObKzgc4d42fAVTR7KEFMooyhW9TSONMacpTjET5XbGtBNsJzSQj5RuX-VBdL",
                        "Content-Type": "application/json"
                    },
                    body: body
                }, function (error, response, body) {
                    console.log(body)
                    if (error)
                        cb({'error': error});
                    else {
                        try {
//                            var arr = JSON.parse(body);
                            cb(null, body);
                        } catch (error) {
                            console.log(error)
                         cb(null);
                        }
                    }
                });
            } else {
                cb("device token not found");
            }
        } else {
            cb("device token not found");
        }


    }, function (err) {
        if (err)
            done(err);

    });
}

module.exports.notificationSend = notificationSend;