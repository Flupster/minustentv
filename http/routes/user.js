const router = require("express").Router();
const canStream = require("../middleware/canStream");

// /api/user get the current user
router.get("/", canStream, async (req, res) => {
  res.status(200).send(req.user);
});

module.exports = router;
