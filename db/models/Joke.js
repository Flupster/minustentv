const mongoose = require("mongoose");

const Joke = new mongoose.Schema(
  {
    discordId: { type: String, index: true },
    joke: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Joke", Joke);
