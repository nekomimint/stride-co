// archivo raiz 
// Este es el que se importara desde los controladores

// importamos la configuracion del sequelize
const sequelize = require('../../config/sequelize');
const User = require('./User');

module.exports = {sequelize, User};