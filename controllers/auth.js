const {User} = require('../models/relationals');
const {verifyPassword} = require('../utils/password');
const jwt = require('jsonwebtoken');

const INVALID_CREDENTIALS = {message: "Invalid credentials"};

function signToken(user){
    const jwtUser = {
        expiresIn: "15m",
        issuer: "stride-co",
        audience: "stride-co-api",
        algorithm: "HS256"
    };

    const secret = "074dfc1b1a6c4d53ea085b140ed0bd369f8c934b";
    return jwt.sign({sub: String(user.id)}, secret, jwtUser);
}

async function login(req, res, next){
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
            expiresIn: "15m"
        }
    });

}




module.exports = {login};