'use strict';

var config = require('config'),
        _ = require('lodash'),
        moment = require('moment'),
        debug = require('debug')('app.helpers.notification'),
        async = require('async'),
        M = require('src/models');
var request = require('request');


// send mail with defined transport object
var notificationSend = function (email, message, data, cb) {
    M.get('UserReg').findOne(
            {where: {
                    id: email
                }}).then(function (data) {
        if (data) {
            if (data.deviceToken) {
                var body = {};
                body.to = data.deviceToken;
                body.notification = {
                    body: message
                };
                body.data = data;
                console.log("++++", JSON.stringify(body));
                request({
                    url: 'https://fcm.googleapis.com/fcm/send',
                    method: 'POST',
                    json: true,
                    headers: {
                        "Authorization": "key=AAAA2nsCJWg:APA91bGSnjjRY0mIabFSZ7glKQXFYndYnnGOyRy9ppyK2RXCDsVUceol90J7saUCyUXEgNozzgJA88kWqm-MoAjSbd7-v2mnd8-AqvOxqWZgp_6gP57cD4911IpDNbBCfyZrpHZfm41-xa2BPQywOh5_WWcdaLSeFw",
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
            console.log(err);
        cb(err);

    });
}

module.exports.notificationSend = notificationSend;