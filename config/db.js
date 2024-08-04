const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useCreateIndex: true, // starting from MongoDB 3.6, indexes are created automatically, and this option is no longer necessary.
    // useFindAndModify: false, // In MongoDB 6.0 and later, this option is deprecated and no longer supported.
    // useUnifiedTopology: true,
  });
  // Mongoose 6, a popular MongoDB ORM for Node.js, also behaves
  // as if
  //  `useNewUrlParser`, `useUnifiedTopology`, and `useCreateIndex` are `true`,
  //  and `useFindAndModify` is `false`.

  console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
};

module.exports = connectDB;
