const router = require("express").Router();
const nms = require("../../helpers/nms");

router.post("/auth", (req, res) => {
  //TODO: Auth requests by stream key
  res.status(201).json({ success: true });
});

// @route /api/nms/*
router.post("/*", (req, res) => {
  nms.onEvent(req.url.substr(1), req.body);
  res.status(201).json({ success: true });
});

module.exports = router;
