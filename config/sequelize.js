// archivo de configuración para configurar la base de datos
// ----------------------- clase 27/09/26 -------------------------------
const {Sequelize} = require('sequelize');
const config = require('config')
const postgresConfig = config.get("postgres")
const fs = require('fs')
const path = require('path')

// Si el host es local (por ejemplo un contenedor de Docker) no hay ssl
// Con cualquier otro host (Render) el SSL sigue siendo obligatorio
const isLocal = ['localhost', '127.0.0.1'].includes(postgresConfig.host);

//Conexion con POSTGRE
const sequelize = new Sequelize(
//Nombre de la base de datos
postgresConfig.database,
//Usuario de la base de datos
postgresConfig.user,
//Password de la base de datos
postgresConfig.password,
    {
//host: define la direccion del servidor de la base de datos
host: postgresConfig.host,
//Puerto: El puerto en el que atiende a nuestro servidor de base de datos
port: Number(postgresConfig.port),
// dialect: es la propiedad donde definimos la base de datos especificamente que vamos a usar
// Dialect changed to PostgreSQL due to Render limitations...
dialect: 'postgres',
dialectOptions: isLocal
    ? {}
    : {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        }
    },
logging: false,
define:{
underscored: true
        }
}
);

console.log("app conectada a: " + postgresConfig.database + " en " + postgresConfig.host);

module.exports = sequelize;