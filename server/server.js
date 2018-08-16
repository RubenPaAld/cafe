require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


app.get('/usuario/:id', (req, res) => {

    const id = req.params.id;
    res.json({
        id
    })
});

app.post('/usuario/:id', (req, res) => {

    let body = req.body;

    if (body.nombre ===undefined) {
        res.status(400).json({
            ok: false,
            mensaje: 'el nombre es necesario'
        });
    } else {
        res.json({
            persona: body
        });
    }
});


app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto 3000');
});