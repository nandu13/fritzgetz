/**
 * Created by sai on 4/11/16.
 */
var NR = require("node-resque"),
    schedule = require('node-schedule');
var redis = require('redis'),
    config = require('config'),
    options = {host: config.redis.host, port: config.redis.port, no_ready_check: true},
    redisClient = redis.createClient(options),
    log = require('src/utils/logger')(module),
    connectionDetails = {redis: redisClient},
    testJob = require('src/scheduler/test-job');
    
var queue;
var jobs = {
    test: {
        jobLock: {}
        ,
        retry: {
            retryLimit: 3,
            retryDelay: (1000 * 5)
        },
        perform: testJob.executeJob
    }
};
////////////////////
// START A WORKER //
////////////////////
var worker = new NR.worker({
    connection: connectionDetails,
    queues: ['jobqueue']
}, jobs);
worker.connect(function () {
    worker.workerCleanup();
    worker.start();
});
///////////////////////
// START A SCHEDULER //
///////////////////////
var scheduler = new NR.scheduler({connection: connectionDetails});
scheduler.connect(function () {
    scheduler.start();
});
/////////////////////////
// REGESTER FOR EVENTS //
/////////////////////////
worker.on('start', function () {
    log.debug("worker started");
});
worker.on('end', function () {
    log.debug("worker ended");
});
worker.on('cleaning_worker', function (worker, pid) {
    log.debug("cleaning old worker " + worker);
});
worker.on('poll', function (queue) {
    log.debug("worker polling " + queue);
});
worker.on('job', function (queue, job) {
    log.debug("working job " + queue + " " + JSON.stringify(job));
});
worker.on('reEnqueue', function (queue, job, plugin) {
    log.debug("reEnqueue job (" + plugin + ") " + queue + " " + JSON.stringify(job));
});
worker.on('success', function (queue, job, result) {
    log.debug("job success " + queue + " " + JSON.stringify(job) + " >> " + result);
});
worker.on('failure', function (queue, job, failure) {
    log.debug("job failure " + queue + " " + JSON.stringify(job) + " >> " + failure);
});
worker.on('error', function (queue, job, error) {
    log.error("error " + queue + " " + JSON.stringify(job) + " >> " + error);
});
worker.on('pause', function () {
    log.debug("worker paused");
});
scheduler.on('start', function () {
    log.debug("scheduler started");
});
scheduler.on('end', function () {
    log.debug("scheduler ended");
});
scheduler.on('poll', function () {
    log.debug("scheduler polling");
});
scheduler.on('master', function (state) {
    log.debug("scheduler became master");
});
scheduler.on('error', function (error) {
    log.error("scheduler error >> " + error);
});
scheduler.on('working_timestamp', function (timestamp) {
    log.debug("scheduler working timestamp " + timestamp);
});
scheduler.on('transferred_job', function (timestamp, job) {
    log.debug("scheduler enquing job " + timestamp + " >> " + JSON.stringify(job));
});
var init = function () {
    queue = new NR.queue({connection: connectionDetails}, jobs);
    queue.on('error', function (error) {
        log.error(error);
    });
    queue.connect(function () {
        queue.cleanOldWorkers(600000, function onCleanOldWorkers(err) {
            if (err) {
                return log.error('=>onCleanOldWorkers', err);
            }
         /*  
            schedule.scheduleJob(config.scheduler.dailyCron, function () {
                if (scheduler.master) {
                    log.debug(">>> enquing challenge daily job");
                    queue.enqueue('jobqueue', 'challengeDaily');
                }
            });
           
            schedule.scheduleJob(config.scheduler.hourlyCron, function () {
                if (scheduler.master) {
                    log.debug(">>> enquing completeChallenge daily job");
                    queue.enqueue('jobqueue', 'completeChallenge', [51]);
                }
            });
            */
        });
    });
};
var enqueDelayedJob = function (delay, jobId, jobData, cb) {
    log.info('=>enqueDelayedJob', delay, jobId, jobData);
    queue.enqueueIn(delay, 'jobqueue', jobId, jobData, cb);
};
var jobModule = {
    init: init,
    enqueDelayedJob: enqueDelayedJob
};
module.exports = jobModule;