// importamos squelize
const { DataTypes} = require('sequelize');
// importamos la instancia de configuracion de sequelize que definimos
// dentro de la carpeta de configuracion
const sequelize = require('../../config/sequelize');

// aqui esta la magia de squeelize modelamos la tabla de users
// como si de un objeto de javascript se tratara
const User = sequelize.define('User', {
    first_name: {type: DataTypes.STRING(100), allowNull:false },
    last_name: {type: DataTypes.STRING(100), allowNull:false },
    email: {type: DataTypes.STRING(150), allowNull:false, unique:true },
    role_id: {type: DataTypes.INTEGER, allowNull: false},
    active: {type: DataTypes.BOOLEAN, defaultValue:true}
}, {
    tableName: 'users',
    timestamps: true 
    //-> created_at, updated_at
});

module.exports = User;


