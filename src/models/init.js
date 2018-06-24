'use strict';
var Sequelize = require("sequelize"),
    config = require('config').db;

var database = require('src/models');

if (!config) {
    console.log('Please provide database configurations');
    process.exit(1);
}


var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    define: {
        timestamps: false
    },
    pool: {
        max: config.maxPoolSize,
        min: config.minPoolSize,
        idle: config.idleConnectionTimeout
    }
});

var models = {
    UserReg: sequelize.import(__dirname + '/user-reg'),
    UserAlter: sequelize.import(__dirname + '/user-alter'),
    Website: sequelize.import(__dirname + '/web-sites'),
    AlterPrice: sequelize.import(__dirname + '/alterPrice')
};

module.exports = models;

module.exports.sequelize = sequelize;

database.set(models, sequelize);
