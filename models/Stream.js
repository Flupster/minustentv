const mongoose = require("mongoose");

const StreamSchema = new mongoose.Schema({
  inputType: String,
  inputSource: String,
  userId: mongoose.Types.ObjectId,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Stream", StreamSchema);
