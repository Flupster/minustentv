const mongoose = require("mongoose");

const StreamSchema = new mongoose.Schema({
  inputType: String,
  inputSource: String,
  userId: String,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Stream", StreamSchema);
