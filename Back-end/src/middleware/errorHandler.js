const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    ok: false,
    message: "Ocurrió un error en el servidor",
    error: err.message,
  });
};

module.exports = errorHandler;
