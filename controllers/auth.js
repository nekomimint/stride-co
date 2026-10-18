const {User} = require('../models/relationals');
const {verifyPassword} = require('../utils/password');
const jwt = require('jsonwebtoken');

const INVALID_CREDENTIALS = {message: "Invalid credentials"};

// agregado clase 17 de octubre
function signToken(user){
    const jwtUser = {
        expiresIn: "15m", // tiempo de expiración
        issuer: "stride-co", // la aplicación que lo emite
        audience: "stride-co-api",
        algorithm: "HS256" // algoritmo a utilizar
    };
    // el atacante puede ver el payload, el sub, pero
    // esto es lo que el atacante no podra recrear:
    const secret = "074dfc1b1a6c4d53ea085b140ed0bd369f8c934b";

    // para entregar el token firmado
    // sub: sujeto, lo que identifica al usuario
    return jwt.sign({sub: String(user.id)}, secret, jwtUser);
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
            expiresIn: "15m"  // indicarle al fronted en cuanto tiempo expira el token
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