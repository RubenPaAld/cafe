const express = require('express');
const {getError} = require('../errors');
const Producto = require('../models/producto');

const {verificacionToken} = require('../middlewares/autenticacion');

const app = express();

//obtener productos
app.get('/producto',verificacionToken ,(req, res) => {

    const desde = Number(req.query.desde || 0);
    const limite = Number(req.query.limite || 5);

    Producto.find({},'nombre precioUni disponible descripcion usuario')
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec( (err,productos) => {
            if (err)
                return getError(res,400,'error al cargar productos',false,err);

            Producto.countDocuments({}, (err,total) => {
                res.json({
                    ok: true,
                    productos,
                    desde,
                    limite,
                    total
                });
            });
        });

});
//mostrar una productos by id
app.get('/producto/:id',verificacionToken ,(req, res) => {

    const id = req.params.id;
    Producto.findById(id,(err,producto) => {

        if (err)
            return getError(res,400,`Error al cargar la categoria ${id}`,false,err);

        if (!producto)
            return getError(res,400,`No existe la categoria ${id}`,false,err);
        res.json({
            ok: true,
            producto
        });
    });
});
//buscar
app.get('/producto/buscar/:termino',verificacionToken ,(req, res) => {

    const termino = req.params.termino;
    const regex = new RegExp(termino,'i');

    Producto.find({$or:[{nombre: regex},{descripcion: regex},{descripcion: regex}]})
        .populate('categoria', 'descripcion')
        .exec((err,productos) => {

        if (err)
            return getError(res,400,`Error al cargar la categoria ${id}`,false,err);

        res.json({
            ok: true,
            productos
        });
    });
});



app.post('/producto',[verificacionToken,], (req, res) => {

    const body = req.body;

    const producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: body.usuario
    });

    producto.save((err, productoDb) => {

        if (err)
            return getError(res,400,'error al crear producto',false,err);

        res.status(201).json({
            ok: true,
            producto: productoDb
        });
    });
});

app.put('/producto/:id',[verificacionToken], (req, res) => {

    const body = req.body;
    const id = req.params.id;
    const disponible = body.disponible;
    const nombre = body.nombre;
    const precioUni = body.precioUni;
    const descripcion = body.descripcion;
    const categoria = body.categoria;
    const usuario = body.usuario;


    Producto.findById(id, (err,producto) => {

        if (err)
            return getError(res,500,`Error al cargar el producto ${id}`,false,err);

        if (!producto)
            return getError(res,400,`No existe el producto ${id}`,false,err);
        
        if (disponible)
            producto.disponible = disponible;
        if (nombre)
            producto.nombre = nombre;
        if (precioUni)
            producto.precioUni = precioUni;
        if (descripcion)
            producto.descripcion = descripcion;
        if (categoria)
            producto.categoria = categoria;
        if (usuario)
            producto.usuario = usuario;

        producto.save((err, productoDb) => {
            if (err)
                return getError(res,500,'',false,err);

            return res.json({
                ok: true,
                producto: productoDb
            })
        });
    });
});

app.delete('/producto/:id',[verificacionToken], (req, res) => {

    const id = req.params.id;

    Producto.findByIdAndRemove(id,{},(err, productoDb) => {

        if (err)
            return getError(res,400,'error al borrar el categoria',false,err);

        if (!productoDb)
            return getError(res,400,'No se encontro categoria',false);

        return res.json({
            ok: true,
            producto: productoDb
        })
    });
});

module.exports = app;
