const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const {getError} = require('../errors');
const app = express();

app.post('/login', (req, res) => {

    const body = req.body;

    Usuario.findOne({email: body.email}, (err, usuarioDb) => {

        if (err)
            return getError(res,500,'error en el login',false,err);

        if (usuarioDb && bcrypt.compareSync(body.password,usuarioDb.password)) {

            const token = jwt.sign({
                usuario: usuarioDb
            },process.env.SEED,{ expiresIn: process.env.CADUCIDAD_TOKEN,
                                 subject: req.connection.remoteAddress
                                });

            res.json({
                ok: true,
                usuario: usuarioDb,
                token,
                emisor: req.connection.remoteAddress
            });
        } else {
            return getError(res, 400, 'Usuario o contraseña incorrectos', false);
        }
    });
});



module.exports = app;