/**
 * Created by dharmendra
 */

'use strict';
var log = require('src/utils/logger')(module),
    redis = require('redis'),
    config = require('config'),
    moment = require('moment');

var redisClient;
var coreRedisClient;

var addToken = function (userId, token, callback) {
    redisClient.set('fr:us:tk:' + userId, token, function (err, reply) {
        if (err) {
            log.info('Token not updated in redis for user ', userId);
            return callback(err);
        } else {
            log.info('Token updated in redis for user ', userId);
            redisClient.expire('fr:us:tk:' + userId, config.token.ttlInSeconds);
            callback(null, token);
        }
    });

};

var getToken = function (userId, callback) {
    redisClient.get('fr:us:tk:' + userId, callback);
};

var deleteToken = function (userId, callback) {
    redisClient.del('fr:us:tk:' + userId, callback);
};


var initCache = function (next) {
    next();
}

var Redis = {
    addToken: addToken,
    getToken: getToken,
    deleteToken: deleteToken,
    initCache: initCache
};

module.exports = function (_module) {

    redisClient = redis.createClient(config.redis.port, config.redis.host, {no_ready_check: true});
    redisClient.on('connect', function () {
        log.debug('=>Connected to Redis .............');
    });
    return Redis;
}


