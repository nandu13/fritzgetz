'use strict';
/*
 * @author dharmendra
 * */

var moment = require('moment');

var M = require('src/models'),
    log = require('src/utils/logger')(module);

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('sns_endpoint', {
        id: {
            type: DataTypes.TEXT,
            field: 'id',
            primaryKey: true
        },
        arn: {
            type: DataTypes.TEXT,
            field: 'arn'
        },
        registrationId: {
            type: DataTypes.TEXT,
            field: 'registration_id'
        },
        createdOn: {
            type: DataTypes.INTEGER,
            field: 'created_on'
        },
        updatedOn: {
            type: DataTypes.INTEGER,
            field: 'updated_on'
        },
        platform:{
            type: DataTypes.TEXT,
            field: 'platform'
        }
    }, {
        freezeTableName: true,
        classMethods: {
            insert: function (user, arn, registrationid, cb) {
                var epoch = moment().unix();
                M.get('sns_endpoint').upsert(
                    {
                        id: user,
                        arn: arn,
                        registrationId: registrationid,
                        updatedOn: epoch,
                        createdOn: epoch
                    })
                    .then(function (data) {
                        return cb ? cb(null, data) : null;
                    }, function (err) {
                        log.error('=>insert', err);
                        return cb ? cb({message: err.message ? err.message : err.toString()}) : null;
                    });
            }
        }
    });
}
