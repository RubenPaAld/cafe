const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
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
            });
        } else {
            return getError(res, 400, 'Usuario o contraseña incorrectos', false);
        }
    });
});

//Configuraciones de google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}


app.post('/google', async (req, res) => {

    const token = req.body.idtoken;
    const clientIp = requestIp.getClientIp(req);
    const googleUser = await verify(token)
        .catch(e => {
           return getError(res,403,'fallo en la autentificacion de google',false,e);
        });

    Usuario.findOne({email: googleUser.email}, (err,usuarioDB)=> {

        if (err)
            return getError(res,500,undefined,false,err);

        if (usuarioDB) {

            if (usuarioDB.google ===false)
                return getError(res,400,'Debe usar su autentificacion normal',false,err);
            else {
                const token = jwt.sign({
                    usuario: usuarioDB
                },process.env.SEED,{ expiresIn: process.env.CADUCIDAD_TOKEN,
                    subject: clientIp
                });
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                });
            }
        } else { //si no existe el usuario en la BD
            const usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = Math.random().toLocaleString();

            usuario.save((err, usuarioDB) => {
                
                if (err)
                    return getError(res,500,'Error al guardar usuario',false,err);

                const token = jwt.sign({
                    usuario: usuarioDB
                },process.env.SEED,{ expiresIn: process.env.CADUCIDAD_TOKEN,
                    subject: clientIp
                });
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                });
            });
        }
    });
});

module.exports = app;