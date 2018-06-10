'use strict';
/*
 * @author dharmendra
 *
 * */

var log = require('src/utils/logger')(module),
    M = require('src/models'),
    moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('sns_topic', {
        id: {
            type: DataTypes.TEXT,
            field: 'id',
            primaryKey: true
        },
        name: {
            type: DataTypes.TEXT,
            field: 'name',
            primaryKey: true
        },
        arn: {
            type: DataTypes.TEXT,
            field: 'arn'
        },
        type: {
            type: DataTypes.TEXT,
            field: 'type'
        },
        createdOn: {
            type: DataTypes.BIGINT,
            field: 'created_on'
        },
        updatedOn: {
            type: DataTypes.BIGINT,
            field: 'updated_on'
        }
    }, {
        freezeTableName: true,
        classMethods: {
        }
    });
}
