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
    log.info('=================> excuteAlertStartJob ', JSON.stringify(userAlert));

    async.waterfall([
        _fetchUrlData.bind(null, userAlert.url),
        _parseUrlData.bind(null, userAlert.url, userAlert.WebsiteID),
        _usertLatestPrice.bind(null, userAlert), //Check user if challenge already complete
        _sendUserNotification.bind(null, userAlert),
    ], function (err, price) {
        log.info('=>err', err);
        if (err) {
            done(err);
        } else
            done(null, price);
    });
};

var _usertLatestPrice = function (userAlert, price, next) {

    var alterPrice = {};
    alterPrice.id = '';
    alterPrice.alertId = userAlert.id;
    alterPrice.price = price;
    alterPrice.WebsiteID = userAlert.WebsiteID;
    alterPrice.createdOn = moment().utc().format('YYYY-MM-DD HH:mm:ss');
    ;
    alterPrice.updatedOn = moment().utc().format('YYYY-MM-DD HH:mm:ss');
    ;
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
    var message = "price  has been dropped for " + userAlert.url + " to " + price;
    console.log("  message ", message);

    var data = {
        url: userAlert.url,
        webSiteId: userAlert.WebsiteID,
        alertID: userAlert.id
    }

    notification.notificationSend(userAlert.AddedByUserID, message, data, function (err, data) {
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

var _parseUrlData = function (url, webSite, urlData, next) {
    log.info('=================> _parseUrlData ', webSite);

    if (urlData) {
//        log.info('=================> excuteAlertStartJob ', urlData);
        var price;
        switch (webSite) {
            case 1:
                var $ = cheerio.load(urlData);
                $("span").each(function () {
                    var link = $(this);
                    var text = link.attr('class');
                    if (text === 'current-price product-price-discounted') {
                        console.log(" -> " + link.text());
                        price = link.text();
                    }

                });
                break;
            case 2:
                var $ = cheerio.load(urlData);
                $("meta").each(function () {
                    var link = $(this);
                    var text = link.attr('name');
                    if (text === 'twitter:data1') {
                        console.log(" -> " + link.attr('content'));
                        price = link.attr('content');
                    }

                });
                break;
            case 3:
                var $ = cheerio.load(urlData);
                $("meta").each(function () {
                    var link = $(this);
                    var text = link.attr('property');
                    if (text === 'og:price:amount') {
                        console.log(" -> " + link.attr('content'));
                        price = link.attr('content');
                    }

                });
                break;
            case 4:
                if (url.indexOf('search') > -1) {

                    var $ = cheerio.load(urlData);
                    var flag = true;
                    $("div").each(function () {
//                    var link = $(this);
                        var link = $(this);
                        console.log("============link  ", link);

                        var text = link.attr('class')
                        console.log("============", text);
                        if (text === 'price' && flag) {
                            flag = false;
                            price = link.text().trim();
                            console.log("============");
                        }

                    });
                } else {
                    var $ = cheerio.load(urlData);
                    var flag = true;
                    $("span").each(function () {
//                    var link = $(this);
                        var link = $(this);
                        console.log("============link  ", link);

                        var text = link.attr('class')
                        console.log("============", text);
                        if (text === 'price' && flag) {
                            flag = false;
                            price = link.text().trim();
                            console.log("============");
                        }

                    });
                }
                break;
            case 6:
                var $ = cheerio.load(urlData);
                $("span").each(function () {
                    var link = $(this);
                    var text = link.attr('class')
                    if (text === 'spv-price__selling highlighted') {
                        console.log(" -> " + link.text());
                        price = link.text();
                    }

                });
                break;
            case 7:
                var $ = cheerio.load(urlData);
                $("label").each(function () {
                    var link = $(this);
                    var text = link.attr('class')
                    if (text === 'a-label js-a-label is-reduced product-price') {
                        console.log(" -> " + link.text());
                        price = link.text();

                    }

                });
                break;
            case 8:
                var $ = cheerio.load(urlData);
                $("p").each(function () {
                    var link = $(this);
                    var text = link.attr('class')
                    if (text === 'sticky-text-info sticky-price--discount') {
                        console.log(" -> " + link.text());
                        price = link.text();

                    }

                });
                break;
            case 9:
                var $ = cheerio.load(urlData);
                $("meta").each(function () {
                    var link = $(this);
                    var text = link.attr('itemprop')
                    if (text === 'price') {
                        console.log(" -> " + link.attr('content'));
                        price = link.attr('content')

                    }

                });
                break;
            case 10:
                var $ = cheerio.load(urlData);
                $("span").each(function () {
                    var link = $(this);
                    var text = link.attr('class')
                    if (text === 'full-price style-scope nap-price') {
                        console.log(" -> " + link.text());
                        price = link.text();
                    }

                });
                break;
            case 11:
                var $ = cheerio.load(urlData);
                $("span").each(function () {
                    var link = $(this);
                    var text = link.attr('class')
                    if (text === 'price-sales') {
                        console.log(" -> " + link.text());
                        price = link.text();
                    }

                });
                break;
            case 12:

                var body = urlData.replace("angular.callbacks._1(", "");
                body = body.replace(")", "");
                price = JSON.parse(body).content.docs[0].price;

                break;
            case 13:
                var $ = cheerio.load(urlData);
                $("meta").each(function () {
                    var link = $(this);
                    var text = link.attr('property');

                    if (text === 'og:description') {
                        var text1 = link.attr('content');
                        price = text1.split(" ")[0]
                    }

                });
                break;
        }
        log.info('=================> _parseUrlData ', price);
        next(null, price);
    }
}



module.exports.excuteUserAlter = excuteUserAlter;
//module.exports.excuteQuaterlyAlterJob = excuteQuaterlyAlterJob;




