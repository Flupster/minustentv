const mongoose = require("mongoose");

const KillSchema = new mongoose.Schema({
  discordId: String,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Kill", KillSchema);
