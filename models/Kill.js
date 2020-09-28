const mongoose = require("mongoose");

const KillSchema = new mongoose.Schema({
  discordId: { type: String, index: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Kill", KillSchema);
