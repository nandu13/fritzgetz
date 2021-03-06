/**
 * Created by dharmendra on 30/8/16.
 */

'use strict';

var async = require('async'),
    moment = require('moment'),
    config = require('config');

var M = require('src/models');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('ProductPriceHistory', {  
        id: {
            type: 'numeric',
            field: 'ID',
            autoIncrement: true,
            primaryKey: true
        },
        WebsiteID: {
            type: 'int',
            field: 'WebsiteID'
        },
        alertId: {
            type: 'int',
            field: 'ProductID'
        },
        price: {
            type: 'nvarchar',
            field: 'price'
        },
        createdOn: {
            type: 'datetime',
            field: 'CreatedDate'
        }
        
    }, {
        freezeTableName: true,
        classMethods: {
           
        }
    });
};
