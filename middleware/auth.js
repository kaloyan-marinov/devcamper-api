const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }
  // else if (req.cookies.token) {
  //   // Set token from Cookie called "token"
  //   token = req.cookies.token;
  // }

  // Make sure token exists
  if (!token) {
    const errorResponse = new ErrorResponse(
      'Not authorized to access this route',
      401
    );

    return next(errorResponse);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    const errorResponse = new ErrorResponse(
      'Not authorized to access this route',
      401
    );

    return next(errorResponse);
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const errorResponse = new ErrorResponse(
        `User role '${req.user.role}' is not authorized to access this route`,
        403
      );

      return next(errorResponse);
    }

    next();
  };
};
