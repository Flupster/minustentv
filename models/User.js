const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  id: String,
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
