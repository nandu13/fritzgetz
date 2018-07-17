/**
 * Created by dharmendra on 30/8/16.
 */

'use strict';

var async = require('async'),
        moment = require('moment'),
        config = require('config');

var M = require('src/models');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('AspNetUsers', {
        id: {
            type: 'nvarchar',
            field: 'Id',
            primaryKey: true
        },
        email: {
            type: 'nvarchar',
            field: 'Email'
        },
        UserName: {
            type: 'nvarchar',
            field: 'UserName'
        },
        EmailConfirmed: {
            type: 'bit',
            field: 'EmailConfirmed'
        },
        password: {
            type: 'nvarchar',
            field: 'PasswordHash'
        },
        SecurityStamp: {
            type: 'nvarchar',
            field: 'SecurityStamp'
        },
        PhoneNumber: {
            type: 'nvarchar',
            field: 'PhoneNumber'
        },
        PhoneNumberConfirmed: {
            type: 'bit',
            field: 'PhoneNumberConfirmed'
        },
        LockoutEndDateUtc: {
            type: 'datetime',
            field: 'LockoutEndDateUtc'
        },
        LockoutEnabled: {
            type: 'bit',
            field: 'LockoutEnabled'
        },
        TwoFactorEnabled:{
            type: 'bit',
            field: 'TwoFactorEnabled'
        },
        AccessFailedCount:{
            type: 'int',
            field: 'AccessFailedCount'
        },
        status: {
            type: 'SMALLINT',
            field: 'status'
        },
        activation: {
            type: 'varchar',
            field: 'activation'
        },
        activationExp: {
            type: 'varchar',
            field: 'activationExp'
        },
        deviceToken: {
            type: 'varchar',
            field: 'deviceToken'
        },
        platform: {
            type: 'varchar',
            field: 'platform'
        }
    }, {
        freezeTableName: true,
        classMethods: {

            fetchLeaderBoard: function (limit, cb) {
                var query = "select first_name,last_name,email,score,profile_pic,nick_name from user_reg " +
                        " where score NOTNULL order by score desc limit" +
                        " " + limit + " ;";
                sequelize.query(query,
                        {type: sequelize.QueryTypes.RAW})
                        .then(function (data) {
                            return cb(null, data[0]);
                        }, function (err) {
                            return cb(err);
                        })
            }
        }
    });
};
