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
    active: {type: DataTypes.BOOLEAN, defaultValue:true},
    password: {type: DataTypes.STRING(100), allowNull: false},
    salt_key: {type: DataTypes.STRING(100), allowNull: false}
}, {
    tableName: 'users',
    timestamps: true 
    //-> created_at, updated_at
});

// para definir como se debe ver el modelo, asi evitamos 
// comprometer información. Esto es para funciones como el create, donde regresamos un json
// una vez insertado. Para list y find se usa attributes
User.prototype.toJSON = function(){
    const values = {...this.get()}; 
    delete values.password;
    delete values.salt_key;
    return values;
}

module.exports = User;