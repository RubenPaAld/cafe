const express = require('express');
const {verificacionTokenURL} = require('../middlewares/autenticacion');
const fs = require('fs');
const path = require('path');
const app = express();

app.get('/imagen/:tipo(usuarios|productos)/:img', verificacionTokenURL, (req,res) =>{

    const tipo = req.params.tipo;
    const img = req.params.img;

    const pathImg = path.resolve(__dirname, `../../${process.env.UPLOAD}${tipo}/${img}`);
    if (fs.existsSync(pathImg))
        return res.sendFile(pathImg);


    const noImagPath = path.resolve(__dirname, '../assets/no-image.jpg');
    return res.sendFile(noImagPath);
});

module.exports = app;