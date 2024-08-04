const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Log to console for dev
  console.log(err.stack.red);

  // Mongoose bad ObjectId
  if (err.name == 'CastError') {
    const message = `Bootcamp not found with id of ${error.value}`;
    // TODO: at 2:45
    error = new ErrorResponse(message, 404);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
