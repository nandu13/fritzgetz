'use strict';

var express = require('express'),
    async = require('async'),
    app = express();

//Initializing console database models
var initializedModels = require('src/models/init');
var models = require('src/models');
models.set(initializedModels);

var http = require('http').Server(app);
var RedisModule = require('src/redis');

http.on('error', function (err) {
    console.log('HTTP Error', err.message);
});

app.set('models', initializedModels)
    .use('/', require('src/rest')(app))


module.exports.start = function (host, port) {

    function _initCache(next) {
        RedisModule.initializeRedis(next);
    }

    function _initScheduler(next) {
        require('src/scheduler').init();
        next();
    }

    function _initServer(next) {
        http.listen(port, host, function () {
            console.log('HTTP Server is ready now @ ', host, ':', port);
            next();
        });
    }

    async.waterfall([
        _initServer,
        _initCache
    ], function onServerInit(err) {
        console.log('=>onServerInit', err);
    });
};