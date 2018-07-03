/**
 * Created by dharmendra on 30/8/16.
 */

'use strict';

var async = require('async'),
    moment = require('moment'),
    config = require('config');

var M = require('src/models');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('userAlert', {  
        id: {
            type: 'numeric',
            field: 'ID',
            autoIncrement: true,
            primaryKey: true
        },
        email: {
            type: 'varchar',
            field: 'email'
        },
        url: {
            type: 'varchar',
            field: 'url'
        },
        articalNumber: {
            type: 'varchar',
            field: 'articalNumber'
        },
        webSite: {
            type: 'varchar',
            field: 'webSite'
        },
        createdOn: {
            type: DataTypes.BIGINT,
            field: 'createdOn'
        },
        updatedOn: {
            type: DataTypes.BIGINT,
            field: 'updatedOn'
        },
        status: {
            type: 'SMALLINT',
            field: 'status'
        },
         price: {
            type: 'real',
            field: 'price'
        }
    }, {
        freezeTableName: true,
        classMethods: {
           
        }
    });
};
