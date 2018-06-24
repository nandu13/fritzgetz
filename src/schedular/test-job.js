/**
 * Created by sai on 4/11/16.
 */

var async = require('async'),
    moment = require('moment'),
    debug = require('debug')('src.scheduler.test-job')

var log = require('src/utils/logger')(module);

var executeJob = function (done) {
    log.info('=>executeJob test job');
    return done(null, 'SUCCESS');
}


module.exports.executeJob = executeJob;
