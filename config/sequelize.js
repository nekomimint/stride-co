// archivo de configuración para configurar la base de datos
// ----------------------- clase 27/09/26 -------------------------------
const {Sequelize} = require('sequelize');

// agregado 23/oct
const config = require('config');
const mysqlConfig = config.get("mysql");

//Conexion con MYSQL
const sequelize = new Sequelize(
    //Nombre de la base de datos
    mysqlConfig.database,
    //Usuario de la base de datos
    mysqlConfig.user,
    //Password de la base de datos
    mysqlConfig.password,
    {
        //host: define la direccion del servidor de la base de datos
        host: mysqlConfig.host,
        //Puerto: El puerto en el que atiende a nuestro servidor de base de datos
        port: mysqlConfig.port,
        // dialect: es la propiedad donde definimos la base de datos especificamente que vamos a usar
        dialect: 'mysql',
        logging: false,
        define:{
            underscored: true
        }
    }
);

console.log("app conectada a: " + mysqlConfig.database);

module.exports = sequelize;