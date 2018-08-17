const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const requestIp = require('request-ip');
const {getError} = require('../errors');
const app = express();

app.post('/login', (req, res) => {

    const body = req.body;
    const clientIp = requestIp.getClientIp(req);

    Usuario.findOne({email: body.email}, (err, usuarioDb) => {

        if (err)
            return getError(res,500,'error en el login',false,err);

        if (usuarioDb && bcrypt.compareSync(body.password,usuarioDb.password)) {

            const token = jwt.sign({
                usuario: usuarioDb
            },process.env.SEED,{ expiresIn: process.env.CADUCIDAD_TOKEN,
                                 subject: clientIp
                                });
            res.json({
                ok: true,
                usuario: usuarioDb,
                token,
                connection_remote_address: req.connection.remoteAddress,
                socket_remote_address: req.socket.remoteAddress,
                //connection_socket_remote_address: req.connection.socket.remoteAddress,
               // info_remote_address: req.info.remoteAddress,
                clientIp
            });
        } else {
            return getError(res, 400, 'Usuario o contraseña incorrectos', false);
        }
    });
});



module.exports = app;