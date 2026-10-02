// archivo de configuración para configurar la base de datos
// ----------------------- clase 27/09/26 -------------------------------
const {Sequelize} = require('sequelize');

//Conexion con MYSQL
const sequelize = new Sequelize(
    //Nombre de la base de datos
    'stride_co',
    //Usuario de la base de datos
    'root',
    //Password de la base de datos
    'abcd1234',
    {
        //host: define la direccion del servidor de la base de datos
        host: 'localhost',
        //Puerto: El puerto en el que atiende a nuestro servidor de base de datos
        port: 3306,
        // dialect: es la propiedad donde definimos la base de datos especificamente que vamos a usar
        dialect: 'mysql',
        logging: false,
        define:{
            underscored: true
        }
    }
);

module.exports = sequelize;