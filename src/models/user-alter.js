/**
 * Created by dharmendra on 30/8/16.
 */

'use strict';

var async = require('async'),
    moment = require('moment'),
    config = require('config');

var M = require('src/models');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('product', {  
        id: {
            type: 'numeric',
            field: 'ID',
            autoIncrement: true,
            primaryKey: true
        },
        AddedByUserID: {
            type: 'nvarchar',
            field: 'AddedByUserID'
        },
        url: {
            type: 'nvarchar',
            field: 'URL'
        },
        WebsiteID: {
            type: 'int',
            field: 'WebsiteID'
        },
        createdOn: {
            type: 'datetime',
            field: 'CreatedDate'
        },
        lastCheckedDate:{
            type: 'datetime',
            field: 'LastCheckedDate'
        },
        updatedOn: {
            type: 'datetime',
            field: 'LastUpdatedDate'
        },
        status: {
            type: 'SMALLINT',
            field: 'status'
        },
        price: {
            type: 'nvarchar',
            field: 'CurrentPrice'
        },
        CreatedByIP: {
            type: 'nvarchar',
            field: 'CreatedByIP'
        },
        LastUpdatedByIP: {
            type: 'nvarchar',
            field: 'LastUpdatedByIP'
        }
    }, {
        freezeTableName: true,
        classMethods: {
           
        }
    });
};
