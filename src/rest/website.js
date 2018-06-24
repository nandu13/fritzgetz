'use strict'
var fs = require('fs'),
        config = require('config'),
        log = require('src/utils/logger')(module),
        constant = require('src/utils/constant'),
        helper = require('src/utils/helper'),
        M = require('src/models'),
        auth1 = require('src/utils/auth'),
        moment = require('moment'),
        async = require('async'),
        notification = require('src/utils/notification');



var getWebsites = function (req, res, next) {
    
    M.get('Website').findAll(
    ).then(function (data) {
        helper.returnTrue(req, res, constant.REG_MESSAGE.SUCCESSFUL, data);
    }).catch(function (err) {
        console.log(err);
         helper.returnFalse(req, res, "Error", err);
    });
};

var webSite = {
    getWebsites: getWebsites
}
module.exports = webSite;
