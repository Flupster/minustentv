const router = require("express").Router();
const nms = require("../helpers/nms");

// @route /api/nms/*
router.post("/*", (req, res) => {
  nms.onEvent(req.url.substr(1), req.body);
  res.status(201).json({ success: true });
});

module.exports = router;
