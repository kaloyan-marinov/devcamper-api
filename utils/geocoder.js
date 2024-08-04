const NodeGeocoder = require('node-geocoder');

// https://github.com/nchaulet/node-geocoder?tab=readme-ov-file#usage-example
const options = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
