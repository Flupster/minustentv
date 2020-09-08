const router = require("express").Router();
const User = require("../../models/User");
const auth = require("../../middleware/auth");

// /api/user get the current user
router.get("/", auth, async (req, res) => {
  const { _id } = req.decoded;
  const user = await User.findOne({ _id });
  const data = {
    _id,
    verified: user.verified,
    streamkey: user.streamkey,
    date: user.date,
  };
  res.status(200).send(data);
});

module.exports = router;
