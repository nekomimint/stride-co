
// Nota que index viene siendo un archivo de configuracion central
// por eso desde aqui seguimos configurando Role, Permission

// importamos la configuracion del sequelize
const sequelize = require('../../config/sequelize');
const User = require('./User');

const Role = require('./Role');
const Permission = require("./Permission");


// ---------------------------------clase 02/10/2026 -------------------------------------
// modelado de la cardinalidad
//----------------------------------------------------------------------------------------
// Role 1 ------> N Users
// ----------------------------------------------------------------------------------------

// un rol tiene una lista de usuarios implicitamente
// entonces a este propiedad le llamamos users as: 'users' 
Role.hasMany(User, {foreignKey: 'role_id', as:'users' })

// User -> Rol
User.belongsTo(Role, {foreignKey: 'role_id', as: 'role'})

// hasMany es del lado que tiene muchos, un rol tiene muchos usuarios
// belognsTo es del lado que tiene solo un usuario tiene un unico rol
// Esto es para poder modelar la cardinalidad


    // -----------------------------------------------------------
    // Role N ---- N Permission
    // -----------------------------------------------------------
    Role.belongsToMany(Permission, 
        {
        through: 'role_permissions', // la tabla intermedia
        foreignKey: 'role_id',  // llave foranea de este lado de la relacion
        otherKey: 'permission_id', // La otra llave foranea
        as: 'permissions', // Plural del segundo modelo, es el nombre de esta relacion
        timestamps: false
    });

    Permission.belongsToMany(Role,{
        through: 'role_permissions', // la tabla intermedia
        foreignKey: 'permission_id',  // llave foranea de este lado de la relacion
        otherKey: 'role_id', // La otra llave foranea
        as: 'roles', // es el nombre de esta relacion, justo coincide con x tiene roles
        timestamps: false
    })


module.exports = {sequelize, User};