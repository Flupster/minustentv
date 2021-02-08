const mongoose = require("mongoose");

const MovieVote = new mongoose.Schema(
  {
    discordId: { type: String, index: true },
    movieId: { type: Number, index: true },
    vote: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MovieVote", MovieVote);
