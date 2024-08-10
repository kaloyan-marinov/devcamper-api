const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
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
  res.status(200).json(res.advancedResults);
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
  // Add user to req.body
  req.body.user = req.user.id;

  // Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({
    user: req.user.id,
  });

  // If the user is not an admin,
  // they can only add one bootcamp.
  if (publishedBootcamp && req.user.role !== 'admin') {
    const errorResponse = new ErrorResponse(
      `The user with ID ${req.user.id} has already published a bootcamp`,
      400
    );

    next(errorResponse);
  }

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
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    // The value in `req.params.id` has the format of an `ObjectId`,
    // but the database doesn't contain an object with that ID.
    const errorReponse = new ErrorResponse(
      `Bootcamp not found with id of ${req.params.id}`,
      404
    );

    return next(errorReponse);
  }

  // Make sure user is bootcamp owner
  // console.log(bootcamp.user.toString());
  // console.log(req.user.id);
  // console.log(req.user.role);
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    const errorResponse = new ErrorResponse(
      `User ${req.user.id} is not authorized to update this bootcamp`,
      403
    );

    return next(errorResponse);
  }

  // The next statement differs from what is used in the tutorial video,
  // because the video calls `Bootcamp.findOneAndUpdate`;
  // but calling that method here crashes with
  // ```
  // ObjectParameterError: Parameter "filter" to findOneAndUpdate() must be an object, got "66b77899a4fd47e3d3160fb9" (type string)
  // ```
  //
  // console.log(req.body);
  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Causes the response to contain the updated JSON (document).
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc      Delete bootcamp
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
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

  // await bootcamp.remove();
  // According to https://stackoverflow.com/a/76449387 ,
  // the preceding call is deprecated, so:
  await bootcamp.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      Get bootcamps within a radius
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder.
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide distance by radius of Earth
  // Earth radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    const errorResponse = new ErrorResponse(
      `Bootcamp not found with id of ${req.params.id}`,
      404
    );

    return next(errorResponse);
  }

  if (!req.files) {
    const errorResponse = new ErrorResponse('Please upload a file', 400);

    return next(errorResponse);
  }

  // console.log(req.files);
  const file = req.files.file; // The right-most "file" corresponds to the key in the HTTP request's form-data.

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    const errorResponse = new ErrorResponse('Please upload an image file', 400);

    return next(errorResponse);
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    const errorResponse = new ErrorResponse(
      `Please upload an image less than ${process.env.MAX_FILE_UPLOAD} bytes`,
      400
    );

    return next(errorResponse);
  }

  // Create custom filename in such a way that guarantees that
  // the custom filename will be unique across all uploaded bootcamp photos
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);

      const errorResponse = new ErrorResponse('Problem with file upload', 500);

      return next(errorResponse);
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, {
      photo: file.name,
    });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
