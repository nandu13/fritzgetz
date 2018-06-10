//'use strict';
//
//
//var config = require('config'),
//    _ = require('lodash'),
//    moment = require('moment'),
//    debug = require('debug')('app.helpers.notification'),
//    async = require('async'),
//    AWS = require('aws-sdk');
//
//
//var log = require('src/utils/logger')(module),
//    C = require('src/utils/constant'),
//    M = require('src/models');
//
//
////S3 Configurations
//AWS.config.region = config.aws.region;
//
//var sns = new AWS.SNS({
//    accessKeyId: config.aws.accessKey,
//    secretAccessKey: config.aws.secret,
//    Bucket: config.aws.bucket
//});
//
//
//// public message to topic
//var pushToTopic = function (data, type, collapseKey, msgAttributes, topicARN, cb) {
//    log.debug('=>pushToTopic', data, type, collapseKey, msgAttributes, topicARN);
//    _sendNotification(data, null, type, collapseKey, msgAttributes, null, topicARN, 'pushToTopic', cb);
//}
//
//// public message to user with arn
//var pushToUser = function (data, type, collapseKey, msgAttributes, endpointARN, platform, cb) {
//    debug('=>pushToUser', data, type, collapseKey, msgAttributes, endpointARN, platform);
//    if (!platform) {
//        return cb ? cb({message: 'Platform empty'}) : null;
//    }
//    if (platform === C.PLATFORM.ANDROID) {
//        _sendNotification(data, null, type, collapseKey, msgAttributes, endpointARN, null, 'pushToUser', cb);
//    } else if (platform === C.PLATFORM.IOS) {
//        _sendNotification(null, data, type, collapseKey, msgAttributes, endpointARN, null, 'pushToUser', cb);
//    } else {
//        return cb ? cb({message: 'Platform empty'}) : null;
//    }
//
//}
//
////Send push to multiple users after fetching arns
//var pushToMultipleUserIds = function (users, data, type, collapseKey, msgAttributes, cb) {
//    log.debug('=>pushToMultipleUserIds', users, data, type, collapseKey, msgAttributes);
//    if ((users || []).length === 0) {
//        return cb();
//    }
//    _fetchUserArns(users, function (err, arnList) {
//        _.forEach((arnList || []), function (arnInfo) {
//            if (arnInfo && arnInfo.arn) {
//                if (arnInfo.platform === C.PLATFORM.ANDROID) {
//                    _sendNotification(data, null, type, collapseKey, msgAttributes, arnInfo.arn, null, 'pushToUser', cb);
//                } else if (arnInfo.platform === C.PLATFORM.IOS) {
//                    _sendNotification(null, data, type, collapseKey, msgAttributes, arnInfo.arn, null, 'pushToUser', cb);
//                }
//
//                // _sendNotification(data, data, type, (collapseKey ? arnInfo.id : collapseKey), msgAttributes, arnInfo.arn, null, arnInfo.id);
//            }
//        });
//        return cb ? cb() : null;
//    });
//}
//
//// public message to multiple user arns
//var bulkPush = function (data, type, collapseKey, msgAttributes, users, cb) {
//    debug('=>bulkPush', data, type, collapseKey, msgAttributes, users);
//    _.forEach((users || []), function (user) {
//        user = user || {};
//        _sendNotification(data, null, type, collapseKey, msgAttributes, user.arn, null, user.user);
//    });
//    return cb ? cb() : null;
//}
//
//var subscribeToTopic = function (topicARN, endPointARN, protocol, callback) {
//    debug('=>subscribeToTopic', topicARN, endPointARN, protocol);
//    var params = {
//        Protocol: protocol, /* required */
//        TopicArn: topicARN, /* required */
//        Endpoint: endPointARN,
//
//    };
//    sns.subscribe(params, function (err, data) {
//        if (err) {
//            log.error('=>_subscribeSNSTopic', endPointARN, topicARN, err);
//            return callback({message: 'Topic subscription failed.'});
//        }
//
//        callback(null, data.SubscriptionArn);
//    });
//}
//
//
//// publish message to user with arn
//var pushToUserId = function (id, data, type, collapseKey, msgAttributes, cb) {
//    debug('=>pushToUserId', data, type, collapseKey, msgAttributes);
//
//    _fetchUserArn(id, function (err, arnInfo) {
//        if (arnInfo && arnInfo.arn) {
//            _sendNotification(data, null, type, (collapseKey ? id : collapseKey), msgAttributes, arnInfo.arn, null, id, cb);
//        } else {
//            log.error('=>pushToUserId Arn info not found for user ', id);
//            return cb ? cb() : null;
//        }
//    });
//}
//
//
//
//var pushToSQSSubscribers = function (data, msgAttributes, topicARN, cb) {
//    log.debug('=>_sendNotificationToSQS', topicARN);
//    _sendNotificationToSQS(data, msgAttributes, topicARN, cb);
//}
//
//var createEndpointARN = function (registrationId, platform, cb) {
//    switch (platform) {
//        case C.PLATFORM.ANDROID:
//            _createAndroidEndpointARN(registrationId, cb);
//            break;
//        case C.PLATFORM.IOS:
//            _createIosEndpointARN(registrationId, cb);
//            break;
//    }
//}
//
//function _notifyUsers(users, message, notificationType, ttl, cb) {
//    var msgAttributes = null;
//    notification.pushToMultipleUserIds(users, message, notificationType, null, msgAttributes, function (err, data) {
//        if (err) {
//             return cb ? cb(err) : null;
//        }
//        return cb ? cb(null) : null;
//    });
//}
//
//function _fetchUserArns(users, cb) {
//    M.get('SnsEndpoint').findAll({
//        where: {id: {'$in': users}},
//        attributes: ['arn','platform']
//    }).then(function (data) {
//        if (!data) {
//            log.error('=>_fetchUserArn No arn found for this user ', users);
//            return cb(null, []);
//        }
//        cb(null, data);
//    }, function (err) {
//        log.error('=>fetchProfile Failed to fetch user arn info', users, err);
//        cb({message: 'Failed to fetch user arn info'});
//    });
//}
//
//function _notifyUser(user, message, notificationType, ttl, cb) {
//    var msgAttributes = null;
//    M.get('SnsEndpoint').findOne({
//        where: {id: user},
//        attributes: ['arn','platform']
//    }).then(function (data) {
//        if (!data) {
//            log.error('=>_notifyTopic No such user', user);
//            return cb({message: 'no such user'});
//        }
//        data = data.get();
//        log.info('=>_notifyUser Arn - ', data);
//
//        notification.pushToUser(message, notificationType, null, msgAttributes, data.arn, data.platform, function (err, data) {
//            if (err) {
//                return cb(err);
//            }
//            cb(null, data);
//        });
//    }, function (err) {
//        log.error('=>_notifyUser', err);
//        cb({message: 'Failed to fetch user arn info'});
//    });
//}
//
//
//var notification = {
//    pushToTopic: pushToTopic,
//    pushToUser: pushToUser,
//    pushToUserId: pushToUserId,
//    pushToMultipleUserIds: pushToMultipleUserIds,
//    bulkPush: bulkPush,
//    subscribeToTopic: subscribeToTopic,
//    createEndpointARN: createEndpointARN,
//    pushToSQSSubscribers: pushToSQSSubscribers,
//    _notifyUser:_notifyUser,
//    _notifyUsers:_notifyUsers
//}
//
//module.exports = notification;
//
//
//// public message to topic or endpoint
//function _sendNotification(data, apnData, type, collapseKey, msgAttributes, endpointARN, topicARN, userId, cb) {
//    log.debug('=>_sendNotification ', userId, endpointARN || topicARN);
//    if (!endpointARN && !topicARN) {
//        return cb ? cb({message: 'Arn empty'}) : null;
//    }
//    if (data) {
//        var stringifiedData = JSON.stringify(data);
//        if (collapseKey) {
//            data = {
//                "GCM": '{\"data\":{\"data\":' + stringifiedData + ',\"type\":\"' + type + '\"},"collapse_key": "' + collapseKey + '"}',
//                //"APNS_SANDBOX":"{\"aps\":{ \"content-available\" : 1,\"sound\" : \"\"},\"key1\":{\"a\":\"bbbb\"}}",
//                "default": ''
//            }
//        } else {
//            data = {
//                "GCM": '{\"data\":' + stringifiedData + ',\"type\":\"' + type + '\","collapse_key": "' + collapseKey + '"}',
//                "default": ''
//            }
//        }
//    }
//
//    // apnData && (data = {"APNS_SANDBOX" : '{\"aps\":{ \"content-available\" : 1,\"sound\" : \"\"},\"type\":\"' + type + '\",\"data\":' + JSON.stringify(apnData) + '}'});
//    apnData && (data = {"APNS": '{ \"aps\" : { \"alert\" : \"' + apnData.message + '\", \"badge\" : 9,\"sound\" :\"default\"}}'});
//
//    var params = {
//        Message: JSON.stringify(data), /* required */
//        //MessageStructure: 'string',
//        MessageStructure: 'json'
//    };
//    if (msgAttributes) {
//        params.MessageAttributes = msgAttributes;
//    }
//    if (endpointARN) {
//        params.TargetArn = endpointARN; // direct message to mobile
//    } else {
//        params.TopicArn = topicARN; // message to a topic
//    }
//
//    console.log('params = >', params);
//    sns.publish(params, function (err, data) {
//        if (err) {
//            if (err.code && err.code === 'EndpointDisabled') {
//                log.error('=>_sendNotification ', userId, endpointARN, topicARN, 'EndpointDisabled');
//                return cb ? cb() : null;
//            } else {
//                log.error('=>_sendNotification ', userId, endpointARN, topicARN, err);
//            }
//            return cb ? cb({message: 'Failed to send notification'}) : null;
//        }
//        log.info('=>Notification sent.', userId, data);
//        return cb ? cb(null, {requestId: data.MessageId}) : null;
//    });
//}
//
//function _sendNotificationToSQS(data, msgAttributes, topicARN, cb) {
//    log.debug('=>_sendNotificationToSQS ', topicARN);
//    if (!topicARN) {
//        return cb ? cb({message: 'Arn empty'}) : null;
//    }
//
//    var stringifiedData = JSON.stringify(data);
//    data = {
//        "sqs": stringifiedData,
//        "default": stringifiedData
//    }
//
//    var params = {
//        Message: JSON.stringify(data), /* required */
//        //MessageStructure: 'string',
//        MessageStructure: 'json'
//    };
//    if (msgAttributes) {
//        params.MessageAttributes = msgAttributes;
//    }
//
//    params.TopicArn = topicARN; // message to a topic
//    sns.publish(params, function (err, data) {
//        if (err) {
//            if (err.code && err.code === 'EndpointDisabled') {
//                log.error('=>_sendNotificationToSQS ', topicARN, 'EndpointDisabled');
//                return cb ? cb() : null;
//            } else {
//                log.error('=>_sendNotificationToSQS ', topicARN, err);
//            }
//            return cb ? cb({message: 'Failed to send notification to sqs'}) : null;
//        }
//        log.info('=>_sendNotificationToSQS Notification sent.', topicARN, data);
//        return cb ? cb(null, {requestId: data.MessageId}) : null;
//    });
//}
//
//
//function _fetchUserArn(user, cb) {
//    //Fetching ARN
//    M.get('NotificationUser').findOne({
//        where: {id: user},
//        attributes: ['arn']
//    }).then(function (data) {
//        if (!data) {
//            log.error('=>_fetchUserArn No arn found for this user ', user);
//            return cb(null, {arn: ''});
//        }
//        data = data.get();
//        cb(null, {arn: data.arn || ''});
//    }, function (err) {
//        log.error('=>fetchProfile Failed to fetch user arn info', user, err);
//        cb({message: 'Failed to fetch user arn info'});
//    });
//}
//
//function _createAndroidEndpointARN(registrationId, cb) {
//    var params = {
//        PlatformApplicationArn: config.aws.androidPlatformArn, /* required */
//        Token: registrationId, /* required */
//        Attributes: {
//            Enabled: 'true'
//        }
//    };
//    sns.createPlatformEndpoint(params, function (err, data) {
//        if (err) {
//            log.error('=>_createAndroidEndpointARN- registrationId', registrationId, JSON.stringify(err, null, 4));
//            return cb({message: 'Arn creation failed'})
//        }
//        cb(null, data.EndpointArn);
//    });
//}
//
//function _createIosEndpointARN(registrationId, cb) {
//    var params = {
//        PlatformApplicationArn: config.aws.iosPlatformArn, /* required */
//        Token: registrationId, /* required */
//        Attributes: {
//            Enabled: 'true'
//        }
//    };
//    sns.createPlatformEndpoint(params, function (err, data) {
//        if (err) {
//            log.error('=>_createIosEndpointARN- registrationId', registrationId, JSON.stringify(err, null, 4));
//            return cb({message: 'Arn creation failed'})
//        }
//        cb(null, data.EndpointArn);
//    });
//}