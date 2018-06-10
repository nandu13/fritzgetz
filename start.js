/**
 * Created by dharmendra on .
 */

'use strict';

require('rootpath')();

//Setting max listeners to infinite.
process.setMaxListeners(0);

var app = require('src'),
    config = require('config'),
    argh = require('argh').argv,
    colors = require('colors');

// DEBUG for stacktrace
if (process.env.ENV !== 'production') {
    require('longjohn');
}
// uncaught exception
process.on('uncaughtException', function (err) {
    console.log('uncaughtException:', err.message);
    console.log(err.stack);
});

var port = +argh.port || config.app.port, //PORT
    host = +argh.host || config.app.host; //HOST

var env = process.env.ENV;
if (env === 'pro') {
    console.log(colors.green('         **** PRODUCTION MODE ****       '));
} else if (env === 'staging') {
    console.log(colors.green('         **** STAGING MODE ****       '));
} else {
    console.log(colors.green('         **** DEVELOPMENT MODE ****       '));
}

app.start(host, port);

