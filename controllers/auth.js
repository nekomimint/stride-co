const config = require("config")
const {User} = require('../models/relationals');
const {verifyPassword} = require('../utils/password');
const jwt = require('jsonwebtoken');
    // el atacante puede ver el payload, el sub, pero
    // esto es lo que el atacante no podra recrear:
    // Never write in code the sensitive data
const SECRET_KEY = config.get('auth.jwtSecret')
const INVALID_CREDENTIALS = {message: "Invalid credentials"};

// agregado clase 17 de octubre
function signToken(user){
    const jwtUser = {
        // tiempo de expiración
        expiresIn: config.get('jwtExpires'),
        // la aplicación que lo emite
        issuer: config.get('jetIssuer'),
        audience: config.get('jwtAudience'),
         // algoritmo a utilizar
        algorithm: "HS256"

        


    };


    // para entregar el token firmado
    // sub: sujeto, lo que identifica al usuario
    return jwt.sign({sub: String(user.id)}, SECRET_KEY, jwtUser);
}

async function login(req, res, next){

    // Un usuario con estado active = false tampoco deberá poder autenticarse || !user.active
    const {email, password} = req.body;
    const user = await User.findOne({where: {email}});
    if (!user || !user.active) return res.status(401).json(INVALID_CREDENTIALS);
    
    const valid = await verifyPassword(password, user.password);
    if(!valid) return res.status(401).json(INVALID_CREDENTIALS);

    res.json({
        message: "Login succesful",
        data:{
            token: signToken(user),
            token_type: "Bearer",
             // indicarle al fronted en cuanto tiempo expira el token
            expiresIn: "15m" 
        }
    });

}



async function getMe(req, res, next) {
    try 
    {
        // El middleware express-jwt que pusimos en clase en app.js
        // ya verifico el token, entonces si llegamos hasta esta parte
        // ya tenemos el payload en .auth.sub (en sub guardamos el id)
        // por lo que podemos hacer:
        const id = req.auth.sub;

        // Buscamos al usuario en la base de datos
        const myUser = await User.findOne({
            where: { id }
        });

        return res.json(myUser);

    } 
    catch (error) 
    {
        next(error);
    }
}




module.exports = {login, getMe};