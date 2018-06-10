/**
 * Created by dharmendra on 29/7/16.
 */
var log = require('src/utils/logger')(module),
    M = require('src/models'),
    moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('notification_archive', {
        id: {
            type: 'SERIAL',
            field: 'id',
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: DataTypes.TEXT,
            field: 'title'
        },
        message: {
            type: DataTypes.JSONB,
            field: 'message'
        },
        type: {
            type: DataTypes.TEXT,
            field: 'type'
        },
        notificationType: {
            type: DataTypes.TEXT,
            field: 'notification_type'
        },
        sendOn: {
            type: DataTypes.BIGINT,
            field: 'send_on'
        },
        updatedOn: {
            type: DataTypes.BIGINT,
            field: 'updated_on'
        },
        userEmail: {
            type: 'CITEXT',
            field: 'user_email'
        }
    }, {
        freezeTableName: true,
        classMethods: {
            fetchNotification: function (userEmail, start, limit, cb) {
                var query = "select * from notification_archive  WHERE user_email = '" + userEmail + "'  " +
                    " ORDER BY send_on desc " +
                    " OFFSET " + start + limit;//" LIMIT 10";
                sequelize.query(query,
                    {type: sequelize.QueryTypes.RAW})
                    .then(function (data) {
                        return cb(null, data[0]);
                    }, function (err) {
                        return cb(err);
                    })
            },
            fetchUserNotificationCount: function (userEmail, start, cb) {
                var query = " SELECT count(*) as notificationcount FROM  notification_archive " +
                    " WHERE user_email = '" + userEmail + "' and send_on >= " +
                    "  (SELECT COALESCE(" +
                    " ( SELECT Sum(last_view) FROM notification_view WHERE email = '" + userEmail + "' )" +
                    " , 0) AS max_id);"
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
}
