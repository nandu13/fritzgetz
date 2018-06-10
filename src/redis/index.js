/**
 * Created by dharmendra
 */

'use strict';
var redisModule = require('redis'),
    debug = require('debug')('src.redis.index'),
    log = require('src/utils/logger')(module),
    config = require('config');

log.info('Redis Connection');
if (!(config || {}).redis) {
    log.error('Please provide redis configuration details.');
    process.exit(1);
}

var redis = require('src/redis/redis')(redisModule);

module.exports.initializeRedis = function (next) {
    log.info('=>initializeRedis');
    redis.initCache(function (err, redisClient) {
        if (err) {
            return next(err);
        }
        next();
    });
}

module.exports.getRedisInstance = function () {
    return redis;
}




