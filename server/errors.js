let getError = (res,codigo,message, ok = false,err = undefined) => {

    return res.status(codigo).json({
        ok: ok,
        err,
        mensaje: message
    });
};

module.exports = {
    getError
};