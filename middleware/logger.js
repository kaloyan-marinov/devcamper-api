// @desc    Logs requests to console
const logger = (req, res, next) => {
  console.log(
    `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`
  );

  // Instruct this middleware to move on to the next middleware.
  next();
};

module.exports = logger;
