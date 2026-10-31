const mongoose = require('mongoose');
const config = require('config')
const mongoConfig = config.get("mongodb")
//Conexion a partir de Mongoose
function connectMongo(){
    const uri = `mongodb+srv://${mongoConfig.user}:${mongoConfig.password}@${mongoConfig.url}`;
    return mongoose.connect(uri);
}

module.exports = connectMongo;