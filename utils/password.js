const bcrypt = require('bcrypt');

async function hashPassword(password) 
{
    // se define el numero de rounds
    const saltKey = await bcrypt.genSalt(10);
    // para el passwordhash tenemos que será  password + saltkey
    const securePassword = await bcrypt.hash(password,saltKey);
    // regresamos el objeto. Recordemos que por defecto las propiedades tendran el 
    //  mismo nombre que las variables: {securePassword: securePassword, saltkey: saltkey    }
    return {securePassword, saltKey}
}

async function verifyPassword(password, passwordHash){
    return bcrypt.compare(password, passwordHash);
}
module.exports = {hashPassword, verifyPassword};