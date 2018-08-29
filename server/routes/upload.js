const express = require('express');
const fileUpload = require('express-fileupload');
const {getError} = require('../errors');
const imageType = require('image-type');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(fileUpload());

app.put('/upload/:tipo(productos|usuarios)/:id', async (req, res) => {

    if (!req.files)
        return getError(res,400,'No se encontraron archivos',false,undefined);

    const tipo = req.params.tipo;
    const id = req.params.id;
    const obj = await select(tipo,id,res);

    if (!obj)
        return getError(res,400,'No se encontro un identificador valido',false,undefined);

    try {
        const archivo = req.files.archivo;
        const ext = imageType(new Uint8Array(archivo.data.slice(0,12)));

        if (!ext)
            return getError(res,400,'No se encontro una imagen valida',false,undefined);

        const nameFile = `${id}-${new Date().getMilliseconds()}.${ext.ext}`;

        archivo.mv(`${process.env.UPLOAD}${tipo}/${nameFile}`, (err) => {
            if (err)
                return getError(res,500,'',false,err);

            if (tipo === 'usuarios')
                updateUser(obj,res,nameFile);
            else
                updateProducto(obj,res,nameFile);
        });
    }catch (e) {
        return getError(res,500,'Imposible evaluar el archivo',false,undefined);
    }
});

const updateUser = (user,res,nameFile) => {

    deleteImage('usuarios',user);

    user.img = nameFile;

    user.save((err,usuarioSave) => {
        if (err)
            return getError(res,500,'',false,err);

        res.json({
            ok:true,
            usuario: usuarioSave,
            img: nameFile
        });
    });
};

const updateProducto = (producto,res,nameFile) => {
    deleteImage('productos',producto);

    producto.img = nameFile;

    producto.save((err,productoSave) => {
        if (err)
            return getError(res,500,'',false,err);

        res.json({
            ok:true,
            producto: productoSave,
            img: nameFile
        });
    });
};

const existUser = (id,res) => {

    return new Promise((resolve, reject) => {
        Usuario.findById(id, (err, user) => {
            if (err)
                return getError(res,500,'',false,err);

            resolve(user);
        });
    });
};

const existProducto = (id,res) => {

    return new Promise((resolve, reject) => {
        Producto.findById(id, (err, producto) => {
            if (err)
                return getError(res,500,'',false,err);

            resolve(producto);
        });
    });
};

const select = (tipo,id, res) => {

    if (tipo === 'usuarios')
        return existUser(id,res);
    return existProducto(id,res);
};

const deleteImage = (tipo,obj) => {
    const pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${obj.img}`);
    if (fs.existsSync(pathImg))
        fs.unlinkSync(pathImg);
};

module.exports = app;