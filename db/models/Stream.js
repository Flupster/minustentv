const mongoose = require("mongoose");
const Cache = require('../../cache');

const Stream = new mongoose.Schema(
  {
    inputType: String,
    inputSource: String,
    discordId: String,
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);


Stream.post('save', async () => {
  await Cache.del('history:stream');
});

module.exports = mongoose.model("Stream", Stream);
