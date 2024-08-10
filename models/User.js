const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ], // At the time when the video was recorded, this regex came from: https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minLength: 6,
    select: false, // When HTTP clients get a User through the API, the server isn't going to send the password in its HTTP response.
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
// (In constrast to statics, the following defines an *instance method*.)
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

// Match user-entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash reset-password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const numBytes = 20;
  const resetToken = crypto.randomBytes(numBytes).toString('hex');

  // Hash token and set resulting hash to `resetPassword` field
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordToken = hashedToken;

  // Set expire
  const tenMinutesInMilliseconds = 10 * 60 * 1000;
  this.resetPasswordExpire = Date.now() + tenMinutesInMilliseconds;

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
