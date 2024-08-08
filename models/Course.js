const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks'],
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tuition cost'],
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
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
});

// Static method to get average of course tuitions
// [across all courses in a specific bootcamp]
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  console.log('Calculating average cost...'.blue);

  const objects = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: {
          $avg: '$tuition', // The field we want to average over
        },
      },
    },
  ]);

  console.log(objects);
};

// Call getAverageCost after save
CourseSchema.post('save', function () {
  this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove
CourseSchema.pre(
  'deleteOne',
  { document: true, query: false }, // Added on suggestion by https://github.com/Automattic/mongoose/issues/7538#issuecomment-505275691,
  function () {
    this.constructor.getAverageCost(this.bootcamp);
  }
);

module.exports = mongoose.model('Course', CourseSchema);
