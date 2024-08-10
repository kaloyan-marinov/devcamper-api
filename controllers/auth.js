const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // Create a JWT
  const token = user.getSignedJwtToken();

  res.status(201).json({
    success: true,
    token,
  });
});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    const errorResponse = new ErrorResponse(
      'Please provide an email and password',
      400
    );

    return next(errorResponse);
  }

  // Check for user
  const user = await User.findOne({
    email,
  }).select('+password');

  if (!user) {
    const errorResponse = new ErrorResponse('Invalid credentials', 401);

    return next(errorResponse);
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    const errorResponse = new ErrorResponse('Invalid credentials', 401);

    return next(errorResponse);
  }

  // Create token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token,
  });
});
