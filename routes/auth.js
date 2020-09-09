const router = require("express").Router();
const User = require("../models/User");
const valid = require("../middleware/valid");
const validateLogin = require("../validation/login");
const validateSignup = require("../validation/signup");

// @route /api/auth/signup
router.post("/signup", valid(validateSignup), async (req, res) => {
  // check if email already exists
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res
      .status(400)
      .json({ error: "user with this email already exists." });
  }
  // create user object
  user = new User(req.body);
  // Hash the password
  user.password = await user.hash(req.body.password);
  // store user in database
  await user.save();

  // log the user in
  const token = user.generateAuthToken();
  res.cookie("token", token, { httpOnly: true });

  res.status(201).send({
    message: "successfully registered user.",
    user: {
      _id: user._id,
      name: user.name,
      date: user.date,
    },
  });
});

// @route /api/auth/login
router.post("/login", valid(validateLogin), async (req, res) => {
  // check if email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ error: "invalid email or password." });
  }
  // check if password is correct
  const valid = await user.compare(req.body.password);
  if (!valid) {
    return res.status(400).json({ error: "invalid email or password." });
  }
  // generate jwt token
  const token = user.generateAuthToken();
  // store token in a browser cookie
  // in production, Add cookie security options
  // for more info check www.npmjs.com/package/cookie#options-1
  res.cookie("token", token, { httpOnly: true });
  res.status(200).json({
    message: "successfully signed in.",
  });
});

// @route /api/auth/signout
router.delete("/signout", (req, res) => {
  // remove the jwt token from the user browser cookie
  res.clearCookie("token");
  res.status(200).send({ message: "successfully signed out." });
});

module.exports = router;
