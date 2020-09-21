const router = require("express").Router();
const auth = require("../middleware/auth");

// /api/user get the current user
router.get("/", auth, async (req, res) => {
  res.status(200).send(req.user);
});

module.exports = router;
