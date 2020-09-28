const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  id: { type: String, index: true },
  username: String,
  avatar: String,
  discriminator: String,
  email: String,
  verified: Boolean,
  locale: String,
  mfa_enabled: String,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
