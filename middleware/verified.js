const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AuthMiddleware = require("./auth");

// Middleware for authentication-protected routes
// Verify token from cookie
const verified = (req, res, next) => {
  AuthMiddleware(req, res, async () => {
    const { _id } = req.decoded;
    const user = await User.findOne({ _id });
    if (!user) {
      return res.status(400).json({ error: "User is not logged in" });
    }
    if (!user.verified) {
      return res.status(400).json({ error: "User is not verified" });
    }
    if (user) {
      req.user = user;
    }
    next();
  });
};

module.exports = verified;
