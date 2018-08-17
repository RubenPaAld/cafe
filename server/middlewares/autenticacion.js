const jwt = require('jsonwebtoken');
const requestIp = require('request-ip');
const {getError} = require('../errors');

/**
 * Verificacion JWT
**/
const verificacionToken = (req, res, next) => {
    const token = req.get('token');
    const clientIp = requestIp.getClientIp(req);

    jwt.verify(token,process.env.SEED,{subject: clientIp} ,(err,decoded) => {

        if (err)
            return getError(res,401,'error de token',false,err);

        req.usuario = decoded.usuario;
        next();
    });
};

const verificacionUsuario = (req, res, next) => {
    const usuario = req.usuario;

    if (usuario.role !== 'ADMIN_ROLE')
        return getError(res,401,'error de permisos',false);

    next();
};


module.exports = {
    verificacionToken,
    verificacionUsuario
};