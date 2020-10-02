const mongoose = require("mongoose");

const Stream = new mongoose.Schema(
  {
    inputType: String,
    inputSource: String,
    discordId: String,
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stream", Stream);
