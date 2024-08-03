const express = require('express');
const dotenv = require('dotenv');

// Load environment variables from a file on disk.
dotenv.config({
  path: './config/config.env',
});

const app = express();

app.get('/api/v1/bootcamps', (req, res) => {
  res.status(200).json({
    success: true,
    msg: 'Show all bootcamps',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running in '${process.env.NODE_ENV}' mode on port ${PORT}`
  );
});
