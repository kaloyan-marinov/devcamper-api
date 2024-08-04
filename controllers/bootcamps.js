const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');

/*
Basically, the symbols defined in this file are *middleware functions*.

A *middleware function* is a function,
runs during the request-response cycle
and, as such, has access to the `req` and `res` objects (as well as to `next`).
*/

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.find();

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @desc      Get single bootcamps
// @route     GET /api/v1/bootcamps/:id
// @access    Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    // The value in `req.params.id` has the format of an `ObjectId`,
    // but the database doesn't contain an object with that ID.
    const errorReponse = new ErrorResponse(
      `Bootcamp not found with id of ${req.params.id}`,
      404
    );

    return next(errorReponse);
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc      Create new bootcamp
// @route     POST /api/v1/bootcamp
// @access    Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc      Update bootcamp
// @route     PUT /api/v1/bootcamps/:id
// @access    Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Causes the response to contain the updated JSON (document).
    runValidators: true,
  });

  if (!bootcamp) {
    // The value in `req.params.id` has the format of an `ObjectId`,
    // but the database doesn't contain an object with that ID.
    const errorReponse = new ErrorResponse(
      `Bootcamp not found with id of ${req.params.id}`,
      404
    );

    return next(errorReponse);
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc      Delete bootcamp
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    // The value in `req.params.id` has the format of an `ObjectId`,
    // but the database doesn't contain an object with that ID.
    const errorReponse = new ErrorResponse(
      `Bootcamp not found with id of ${req.params.id}`,
      404
    );

    return next(errorReponse);
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});
