// importamos squelize
const { DataTypes} = require('sequelize');
// importamos la instancia de configuracion de sequelize que definimos
// dentro de la carpeta de configuracion
const sequelize = require('../../config/sequelize');

// aqui esta la magia de squeelize modelamos la tabla de users
// como si de un objeto de javascript se tratara
const Permission = sequelize.define('Permission', {
    key: {type: DataTypes.STRING(100), allowNull:false, unique: true },
    description: {type: DataTypes.STRING(255), allowNull:false },
}, {
    tableName: 'permissions',
    timestamps: true 
    //-> created_at, updated_at
});

module.exports = Permission;

