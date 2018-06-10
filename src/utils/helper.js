/**
 * Created by Ashish on 9/9/16.
 */
'use strict';

var config = require('config'),
    fs = require('fs'),
    log = require('src/utils/logger')(module),
    constant = require('src/utils/constant'),
    moment = require('moment'),
    async = require('async'),
    M = require('src/models');

var request = require("request");
var queryString = require('querystring');

var returnTrue = function (req, res, message, arr){

    return res.status(200).json(
        {
            "result": {
                success: true,
                message: message
            },
            "data": arr
        }
    );
};

var returnFalse = function (req, res, message, arr){

    return res.status(200).json(
        {
            "result": {
                success: false,
                message: message
            },
            "data": arr
        }
    );
};

var performRequest = function (endpoint, method, data, success) {

    var host = config.devices.jawbone.jbhost;
    endpoint += '?' + queryString.stringify(data);

    request({
        uri: host + endpoint,
        method: "GET",
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10
    }, function(error, response, body) {
        console.log(body);
        var arr = JSON.parse(body);
        success(arr);
    });
};

var performRequestFB = function (endpoint, method, data, success) {

    var host = config.devices.fitbit.fbhost;
    endpoint += '?' + queryString.stringify(data);

    //var rd = config.devices.fitbit.redirect_uri;
    //rd = rd.replace('%server%',config.email.params.server);

    request({
        url: host + config.devices.fitbit.fbendpoint,
        method: "POST",
        timeout: 10000,
        headers: {
            'content-type' : 'application/x-www-form-urlencoded',
            "Authorization": 'Basic ' +  new Buffer(data.client_id + ':' + data.client_secret).toString('base64')
        },
        form: {
            "grant_type": data.grant_type,
            "code": data.code,
            "redirect_uri": config.devices.fitbit.redirect_url.replace('%server%',config.email.params.server),
            "client_id": data.client_id,
            "client_secret": data.client_secret,
            "expires_in": config.devices.fitbit.expire
        }
    }, function(error, response, body) {
        if ( error ) success({'error':error});
        try {
            console.log(body);
            var arr = JSON.parse(body);
            success(arr);
        } catch( error ) {
            success({'error':error});
        }
    });
};



var FBRequestActivity = function (url, method, token, success) {
    request({
        url: url,
        method: method,
        timeout: 10000,
        headers: {
            "Authorization": 'Bearer ' +  token
        }
    }, function(error, response, body) {
        if ( error ) success({'error':error});
        try {
            console.log(body);
            // var arr = JSON.parse(body);
            success(JSON.parse(body.replace('-','')));
        } catch( error ) {
            success({'error':error});
        }
    });
};

var JBRequestActivity = function (url, method, token, success) {
    request({
        url: url,
        method: method,
        timeout: 10000,
        headers: {
            "Authorization": 'Bearer ' +  token
        }
    }, function(error, response, body){
        if ( error ) success({'error':error});
        try {
            //console.log(body);
            // var arr = JSON.parse(body);
            success(JSON.parse(body));
        } catch( error ) {
            success({'error':error});
        }
    });
};

var FBRequest = function (url, method, token, success) {
    request({
        url: url,
        method: method,
        timeout: 10000,
        headers: {
            "Authorization": 'Bearer ' +  token
        }
    }, function(error, response, body) {
        if ( error ) success({'error':error});
        try {
            console.log(body);
            var arr = JSON.parse(body);
            success(arr);
        } catch( error ) {
            success({'error':error});
        }
    });
};

var JBRequest = function (url, method, token, success) {

    request({
        url: url,
        method: method,
        timeout: 10000,
        headers: {
            "Authorization": 'Bearer ' +  token
        }
    }, function(error, response, body) {
        if ( error ) success({'error':error});
        try {
            console.log(body);
            var arr = JSON.parse(body);
            success(arr);
        } catch( error ) {
            success({'error':error});
        }
    });
};

var getToken = function (id, success){
    var UserTok = M.get('UserToken');
    UserTok.findOne({
        where: {user_id: id}
    })
        .then(function (userToken) {
            success(userToken.token);
        }, function (err) {
        helper.returnFalse(req,res,constant.ERROR.USER_TOKEN_NOT_FOUND,{accountStatus: constant.ACCOUNT_STATUS.ERROR});
    });
};

var mkdir_p = function (path, mode, position, callback) {
    mode = mode || '0777';
    position = position || 0;
    var parts = require('path').normalize(path).split('/');

    if (position >= parts.length) {
        if (callback) {
            return callback();
        } else {
            return true;
        }
    }

    var directory = parts.slice(0, position + 1).join('/');
    fs.stat(directory, function(err) {
        if (err === null) {
            helper.mkdir_p(path, mode, position + 1, callback);
        } else {
            fs.mkdir(directory, mode, function (err) {
                if (err) {
                    if (callback) {
                        return callback(err);
                    } else {
                        throw err;
                    }
                } else {
                    helper.mkdir_p(path, mode, position + 1, callback);
                }
            })
        }
    })
};

var helper = {
    returnTrue: returnTrue,
    returnFalse: returnFalse,
    performRequest: performRequest,
    performRequestFB: performRequestFB,
    getToken: getToken,
    FBRequest: FBRequest,
    JBRequest: JBRequest,
    mkdir_p: mkdir_p,
    FBRequestActivity:FBRequestActivity,
    JBRequestActivity:JBRequestActivity
};

module.exports = helper;
