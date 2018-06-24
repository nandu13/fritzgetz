/**
 * Created by dharmendra on 30/8/16.
 */

'use strict';

var async = require('async'),
    moment = require('moment'),
    config = require('config');

var M = require('src/models');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('UserRegistration', {  
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
        firstName: {
            type: 'varchar',
            field: 'firstName'
        },
        lastName: {
            type: 'varchar',
            field: 'lastName'
        },
        password: {
            type: 'varchar',
            field: 'password'
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
        activation:{
            type: 'varchar',
            field: 'activation'
        },
        activationExp:{
            type: 'varchar',
            field: 'activationExp'
        },
        deviceToken:{
            type: 'varchar',
            field: 'deviceToken'
        },
        platform:{
            type: 'varchar',
            field: 'platform'
        }
    }, {
        freezeTableName: true,
        classMethods: {
           
            fetchLeaderBoard: function ( limit, cb) {
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
