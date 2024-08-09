const advancedResults = (model, populate) => async (req, res, next) => {
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
  query = model.find(JSON.parse(queryStr));

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
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  //  5) Perform a `populate` operation
  if (populate) {
    query = query.populate(populate);
  }

  // Execute query
  const results = await query;

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

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
