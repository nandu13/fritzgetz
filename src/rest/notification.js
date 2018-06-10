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
    var registrationId = req.body.device_token;
    var platform = (req.body.platform || '').toLowerCase();
    if (!platform) {
        platform = C.PLATFORM.ANDROID;
    }

    notification.createEndpointARN(registrationId, platform, function (err, arn) {
        if (err) {
            log.error('=>register failed to create platform endpoint for user', user, JSON.stringify(err, null, 4));
            return next();
        }
        log.info('=>register success', arn);
        var epoch = moment().unix();
        M.get('SnsEndpoint').upsert(
            {
                id: user,
                arn: arn,
                registrationId: registrationId,
                updatedOn: epoch,
                createdOn: epoch,
                platform: platform
            })
            .then(function (data) {
                _subscribeDefaultTopics(user, arn, function onDefaultTopicsSubs(err) {
                    if (err) {
                        log.error('=>onDefaultTopicsSubs', err);
                        return next({code: C.ERRORS.BG_REQ_FAILED, status: 500});
                    }
                    //Send welcome push
                });
                return next ? next(null, data) : next;
            }, function (err) {
                log.error('=>insert', err);
                return next ? next({message: err.message ? err.message : err.toString()}) : next;
            });
    });
}

function fetchUserNotification(req, res, next) {
    var user = req.user;
    var queryParams = req.query;
    var limit = queryParams.count ? ' LIMIT ' + queryParams.count : ' ';
    var offset = queryParams.start - 1;

    M.get('NotificationArchive')
        .fetchNotification(user.user, offset, limit, function (err, data) {
            if (err) {
                return helper.returnFalse(req, res, C.REG_MESSAGE.NOTIFICATION_FETCH_FAILED, {});
            }
            return helper.returnTrue(req, res, C.REG_MESSAGE.NOTIFICATION_FETCH_SUCCESS, data);
        });


}
var notificationRoute = {
    send: send,
    register: register,
    fetchUserNotification:fetchUserNotification
    // _notifyUser :_notifyUser
};

module.exports = notificationRoute;

function _subscribeDefaultTopics(user, userArn, cb) {
    cb();
}

function _reSubscribeAllTopics(user, userArn, cb) {
    models.get('NotificationTopicSubscription').findAll({
        where: {userId: user},
        attributes: ['topicId']
    }).then(function (subscriptions) {
        var topicIds = [];
        subscriptions.forEach(function (subscription) {
            topicIds.push(subscription.topicId);
        });
        if (!topicIds || topicIds.length === 0) {
            return cb();
        }
        //Fetching topic Arns for every topic
        models.get('NotificationTopic').findAll({where: {id: {'$in': topicIds}}, attributes: ['id', 'arn']}).then(
            function (topics) {
                _subscribeMultipleTopics(user, topics, userArn, true, cb);
            }, function (err) {
                cb({message: err.message ? err.message : err.toString()});
            }
        );
    }, function (err) {
        cb({message: err.message ? err.message : err.toString()});
    });
}

//Notify user


//Notify user
function _notifyTopic(topic, message, notificationType, cb) {
    M.get('NotificationTopic').findOne({
        where: {id: topic},
        attributes: ['arn']
    }).then(function (data) {
        if (!data) {
            log.error('=>_notifyTopic No such topic', topic);
            return cb({message: 'no such topic'});
        }
        data = data.get();
        log.info('=>_notifyTopic Arn - ', data);

        notification.pushToTopic(message, notificationType, null, null, data.arn, function (err, data) {
            if (err) {
                return cb(err);
            }
            cb(null, data);
        });
    }, function (err) {
        log.error('=>_notifyTopic', err);
        cb({message: 'Failed to fetch topic arn info'});
    });
}

function _subscribeMultipleTopics(user, topics, userArn, replace, cb) {
    var parallelCalls = {};

    topics.forEach(function (topic) {
        parallelCalls[topic.id] = notification.subscribeToTopic.bind(notification, topic.arn, userArn, 'Application');
    });

    //Subscribing to all the topics at once.
    async.parallel(parallelCalls, function (err, results) {

        if (err) {
            log.error('=>_subscribeMultipleTopics', user, err);
            return cb({message: 'Failed to subscribe on default topics'});
        }

        var subscriptions = [];
        var epoch = moment().unix();
        //Topics subscribed @AWS Persisting...
        _.forEach(results, function (subscriptionArn, topicId) {
            subscriptions.push({
                userId: user,
                topicId: topicId,
                subscriptionArn: subscriptionArn,
                subscriptionOn: epoch
            });
        });

        if (replace) { //Update existing
            models.get('NotificationTopicSubscription')
                .bulkUpdate(user, subscriptions, function (err) {
                    if (err) {
                        log.error('=>_subscribeMultipleTopics Failed to persist topic subscription for user', user, subscriptions);
                        return cb({message: 'Failed to persist topic subscriptions'});
                    }
                    cb();
                });
        } else { //Insert new
            models.get('NotificationTopicSubscription')
                .insertAll(subscriptions, function (err) {
                    if (err) {
                        log.error('=>_subscribeMultipleTopics Failed to persist topic subscription for user', user, subscriptions);
                        return cb({message: 'Failed to persist topic subscriptions'});
                    }
                    cb();
                });
        }
    });
}
