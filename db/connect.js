const mongoose = require('mongoose');
const constants = require('../src/config/constants');

const { DATABASE_URI } = constants;
const connectDB = () => mongoose.connect(DATABASE_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

module.exports = connectDB;
