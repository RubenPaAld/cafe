const getError = (res,codigo,message = undefined, ok = false,err = undefined) => {

    return res.status(codigo).json({
        ok: ok,
        err,
        mensaje: message
    });
};

module.exports = {
    getError
};