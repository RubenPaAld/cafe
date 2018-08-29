const express = require('express');
const {getError} = require('../errors');
const Categoria = require('../models/categoria');
const {verificacionToken, verificacionUsuario} = require('../middlewares/autenticacion');

const app = express();

//obtener categorias
app.get('/categoria',verificacionToken ,(req, res) => {

    const desde = Number(req.query.desde || 0);
    const limite = Number(req.query.limite || 5);

    Categoria.find({},'descripcion usuario')
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .exec( (err,categorias) => {
            if (err)
                return getError(res,400,'error al cargar categorias',false,err);

            Categoria.countDocuments({}, (err,total) => {
                res.json({
                    ok: true,
                    categorias,
                    desde,
                    limite,
                    total
                });
            });
        });

});
//mostrar una categoria by id
app.get('/categoria/:id',verificacionToken ,(req, res) => {

    const id = req.params.id;
    Categoria.findById(id,(err,categoria) => {

        if (err)
            return getError(res,400,`Error al cargar la categoria ${id}`,false,err);

        if (!categoria)
            return getError(res,400,`No existe la categoria ${id}`,false,err);
        res.json({
            ok: true,
            categoria
        });
    });
});

app.post('/categoria',[verificacionToken,], (req, res) => {

    const body = req.body;

    const categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario
    });
    categoria.save((err, categoriaDb) => {

        if (err)
            return getError(res,400,'error al crear categoria',false,err);

        res.json({
            ok: true,
            categoria: categoriaDb
        });
    });

});

app.put('/categoria/:id',[verificacionToken], (req, res) => {

    const body = req.body;
    const id = req.params.id;
    const descripcion = body.descripcion;

    Categoria.findById(id, (err,categoria) => {

        if (err)
            return getError(res,400,`Error al cargar la categoria ${id}`,false,err);

        categoria.descripcion = descripcion;

        categoria.save((err, categoriaDb) => {
            if (err)
                return getError(res,400,'',false,err);

            return res.json({
                ok: true,
                categoria: categoriaDb
            })
        });
    });
});

app.delete('/categoria/:id',[verificacionToken,verificacionUsuario], (req, res) => {

    const id = req.params.id;

    Categoria.findByIdAndRemove(id,{},(err, categoriaDb) => {

        if (err)
            return getError(res,400,'error al borrar el categoria',false,err);

        if (!categoriaDb)
            return getError(res,400,'No se encontro categoria',false);

        return res.json({
            ok: true,
            categoria: categoriaDb
        })
    });
});

module.exports = app;

