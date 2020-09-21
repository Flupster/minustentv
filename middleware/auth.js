const auth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.status(400).json({ error: "User is not logged in" });
  }
};

module.exports = auth;
