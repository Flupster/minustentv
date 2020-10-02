const mongoose = require("mongoose");

const User = new mongoose.Schema(
  {
    id: { type: String, index: true },
    username: String,
    avatar: String,
    discriminator: String,
    email: String,
    verified: Boolean,
    locale: String,
    mfa_enabled: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", User);
