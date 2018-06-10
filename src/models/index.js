'use strict';
var models, sequelize;

module.exports.get = function (model) {
    return models[model];
};

module.exports.getSequelizeInstance = function () {
    return sequelize;
};

module.exports.set = function (dbModels, db) {
    models = dbModels;
    sequelize = db;
};