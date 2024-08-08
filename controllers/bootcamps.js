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
  let query;

  // Create a copy of `req.query`
  const reqQuery = { ...req.query };

  // Fields to exclude (from use-for-filtering)
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over `removeFields` and delete them from `reqQuery`
  removeFields.forEach((param) => {
    delete reqQuery[param];
  });

  console.log(reqQuery);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create Mongoose operators (such as `$gt`, `$gte`, etc.)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Build query in steps.
  //  1) Create query for finding resources
  query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

  //  2) Select fields
  if (req.query.select) {
    const fields = req.query.select.split(',');
    query = query.select(fields);
  }

  //  3) Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  //  4) Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const bootcamps = await query;

  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
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

  res.status(400).json({
    success: false,
    data: {
      msg: 'this endpoint is still under construction',
    },
  });
});
