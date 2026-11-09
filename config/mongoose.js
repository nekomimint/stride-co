const mongoose = require('mongoose');
const config = require('config')
const os = require('os');
const mongoConfig = config.get("mongodb")
//Conexion a partir de Mongoose
function connectMongo()
{
    const uri = `${mongoConfig.protocol}${mongoConfig.user}:${mongoConfig.password}@${mongoConfig.url}/${mongoConfig.database}`;
    return mongoose.connect(uri, {
        runtimeAdapters: { os }
    });
}

module.exports = connectMongo;
