const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for the review'],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, 'Please add some text'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

// The following creates an index on the model, which enforces that
// each `User` should be able to create at most one `Review` per `Bootcamp`.
ReviewSchema.index(
  {
    bootcamp: 1,
    user: 1,
  },
  {
    unique: true,
  }
);

// Static method to get average rating and save
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  console.log('Calculating average rating...'.blue);

  const objects = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageRating: {
          $avg: '$rating', // The field we want to average over
        },
      },
    },
  ]);

  // console.log(objects);
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageRating: objects[0].averageRating,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function () {
  console.log(`ReviewSchema.post('save', ...) - ${this.bootcamp}`);

  this.constructor.getAverageRating(this.bootcamp);
});

ReviewSchema.post(
  'deleteOne',
  { document: true, query: false }, // Added on suggestion by https://github.com/Automattic/mongoose/issues/7538#issuecomment-505275691,
  function () {
    console.log(`ReviewSchema.pre('deleteOne', ...) - ${this.bootcamp}`);

    this.constructor.getAverageRating(this.bootcamp);
  }
);

module.exports = mongoose.model('Review', ReviewSchema);
