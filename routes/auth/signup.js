const router = require("express").Router();

const User = require("../../models/User");
const valid = require("../../middleware/valid");
const validateSignup = require("../../validation/signup");

// @route /api/auth/signup
router.post("/", valid(validateSignup), async (req, res) => {
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

module.exports = router;
