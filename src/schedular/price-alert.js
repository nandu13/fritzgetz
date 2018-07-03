/**
 * Created by sai on 20/11/16.
 */

/** Third parties here **/
var async = require('async'),
        moment = require('moment'),
        config = require('config');

/** Application modules here **/
var C = require('src/utils/constant'),
        log = require('src/utils/logger')(module),
        notification = require('src/utils/notification'),
        M = require('src/models');
var request = require('request');
var cheerio = require('cheerio');


//var excuteQuaterlyAlterJob = function (done) {
//    log.info('=============> enqueueChallengeStartJob ', challengesId, email);
//    var now = new Date();
//    var diff = (miliseconds * 1000) - now.getTime();
//    log.info('enqueueChallengeStartJob', now.getTime(), miliseconds, diff);
//    require('src/scheduler').enqueDelayedJob(diff, 'challengeStart', [challengesId, email]);
//    // done(null);
//    // });
//}


var excuteUserAlter = function (userAlert, done) {
    log.info('=================> excuteAlertStartJob ');

    async.waterfall([
        _fetchUrlData.bind(null, userAlert.url),
        _parseUrlData.bind(null, userAlert.webSite),
        _usertLatestPrice.bind(null, userAlert), //Check user if challenge already complete
        _sendUserNotification.bind(null, userAlert),
    ], function (err,price) {
        log.info('=>err', err);
        if (err) {
            done(err);
        } else
            done(null,price);
    });
};

var _usertLatestPrice = function (userAlert, price, next) {

    var alterPrice = {};
    alterPrice.id = '';
    alterPrice.alertId = userAlert.id;
    alterPrice.price = price;
    alterPrice.email = userAlert.email;
    alterPrice.createdOn = moment().unix();
    alterPrice.updatedOn = moment().unix();
    console.log('  alterPrice ', JSON.stringify(alterPrice));
    M.get('UserAlter').update({
        price: price
    }, {
        where: {
            id: userAlert.id
        }
    }
    ).then(function (data) {
    }, function (err) {
    });
    M.get('AlterPrice').create(
            alterPrice).then(function (data) {
        next(null, price);
    }, function (err) {
        if (err)
            next(err);

    });


};

var _sendUserNotification = function (userAlert, price, next) {
    var message = "Current price of alter " + userAlert.id + " is " + price;
    console.log("  message ", message);
    notification.notificationSend(userAlert.email, message, function (err, data) {
        if (err) {
            console.log('Notification error ->', err);
            next(err);
        } else {
            console.log('Notification send ->', data);
            next(null, price);
        }
    })

};

var _fetchUrlData = function (url, next) {
    request({
        url: url,
        method: 'GET'

    }, function (error, response, body) {
        if (error)
            next({'error': error});
        else {
            try {

                next(null, body);
            } catch (error) {
//            next({'error': error});
            }
        }
    });
};

var _parseUrlData = function (webSite, urlData, next) {
    log.info('=================> _parseUrlData ', webSite);

    if (urlData) {
//        log.info('=================> excuteAlertStartJob ', urlData);
        var price;
        switch (webSite) {
            case 'ASOS':
//                productUrl = body.url;
                break;
            case 'Zalando':
//                productUrl = body.url;
                break;
            case 'Topshop':
//                productUrl = body.url;
                break;
            case 'H&M':
                var $ = cheerio.load(urlData);
                $("span").each(function () {
                    var link = $(this);
                    var text = link.attr('class')
                    if (text === 'price-value') {
                        console.log(" -> " + link.text().trim().split('Rs.')[1].trim());
                        price = link.text().trim().split('Rs.')[1].trim();
                    }

                });
                break;
            case 'ESPRIT':
//                productUrl = body.url;
                break;
            case 'COSSTORES':
//                productUrl = body.url;
                break;
            case 'SHOP.MANGO':
//                productUrl = body.url;
                break;
            case 'BREUNINGER':
//                productUrl = body.url;
                break;
            case 'NET A PORTER':
//                productUrl = body.url;
                break;
            case 'UNIQLO':
//                productUrl = body.url;
                break;
        }
        log.info('=================> _parseUrlData ', price);
        next(null, price);
    }
}


module.exports.excuteUserAlter = excuteUserAlter;
//module.exports.excuteQuaterlyAlterJob = excuteQuaterlyAlterJob;




