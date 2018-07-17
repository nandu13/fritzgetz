/**
 * Created by dharmendra on 30/8/16.
 */

'use strict';

var async = require('async'),
    moment = require('moment'),
    config = require('config');

var M = require('src/models');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Website', {  
        id: {
            type: 'numeric',
            field: 'ID',
            autoIncrement: true,
            primaryKey: true
        },
        URL: {
            type: 'nvarchar',
            field: 'URL'
        },
        Name: {
            type: 'nvarchar',
            field: 'Name'
        },
        SearchURL: {
            type: 'nvarchar',
            field: 'SearchURL'
        },
    }, {
        freezeTableName: true,
        classMethods: {
           
        }
    });
};
