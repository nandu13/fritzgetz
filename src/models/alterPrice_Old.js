/**
 * Created by dharmendra on 30/8/16.
 */

'use strict';

var async = require('async'),
    moment = require('moment'),
    config = require('config');

var M = require('src/models');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('alterPrice', {  
        id: {
            type: 'numeric',
            field: 'ID',
            autoIncrement: true,
            primaryKey: true
        },
        alertId: {
            type: 'numeric',
            field: 'alertId'
        },
        email: {
            type: 'varchar',
            field: 'email'
        },
        price: {
            type: 'real',
            field: 'price'
        },
        createdOn: {
            type: DataTypes.BIGINT,
            field: 'createdOn'
        },
        updatedOn: {
            type: DataTypes.BIGINT,
            field: 'updatedOn'
        }
    }, {
        freezeTableName: true,
        classMethods: {
           
        }
    });
};
