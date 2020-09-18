const mongoose = require("mongoose");

const KillSchema = new mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Kill", KillSchema);
