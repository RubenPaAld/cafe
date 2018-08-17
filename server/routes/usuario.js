const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');
const {getError} = require('../errors');
const {verificacionToken, verificacionUsuario} = require('../middlewares/autenticacion');

const app = express();

app.get('/usuario',verificacionToken ,(req, res) => {

    const desde = Number(req.query.desde || 0);
    const limite = Number(req.query.limite || 5);

    Usuario.find({estado: true},'nombre email img role estado google')
        .skip(desde)
        .limit(limite)
        .exec( (err,usuarios) => {
            if (err)
                return getError(res,400,'error al cargar usuarios',false,err);

            Usuario.countDocuments({estado: true}, (err,total) => {
                res.json({
                    ok: true,
                    usuarios,
                    desde,
                    limite,
                    total
                })
            });
        });

});

app.post('/usuario',[verificacionToken,verificacionUsuario], (req, res) => {

    const body = req.body;

    const usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });
    usuario.save((err, usuarioDb) => {

        if (err)
            return getError(res,400,'error al crear usuario',false,err);

        res.json({
            ok: true,
            usuario: usuarioDb
        });
    });

});

app.put('/usuario/:id',[verificacionToken,verificacionUsuario], (req, res) => {

    const id = req.params.id;
    const body = _.pick(req.body,['nombre','email','img','role','estado']);

    Usuario.findByIdAndUpdate(id,body,{new: true, runValidators: true},(err, usuarioDb) => {

        if (err)
            return getError(res,400,'error al actualizar el usuario',false,err);

        return res.json({
            usuario: usuarioDb
        })
    });
});

app.delete('/usuario/:id',[verificacionToken,verificacionUsuario], (req, res) => {

    const id = req.params.id;
    const newEstado = {
        estado: false
    };

    Usuario.findByIdAndUpdate(id,newEstado,{new: true},(err, usuarioDb) => {

        if (err)
            return getError(res,400,'error al borrar el usuario',false,err);

        return res.json({
            usuario: usuarioDb
        })
    });
});

/*
app.delete('/usuario/:id',verificacionToken, (req, res) => {

    const id = req.params.id;

    Usuario.findByIdAndRemove(id,{},(err, usuarioDb) => {

        if (err)
            return getError(res,400,'error al borrar el usuario',false,err);

        if (!usuarioDb)
            return getError(res,400,'No se encontro usuario',false);

        return res.json({
            ok: true,
            usuario: usuarioDb
        })
    });
});
*/

module.exports = app;

