const router = require("express").Router();
const Webhook = require("../../helpers/webhook");

// @route /api/radarr/webhook
router.post("/webhook", async (req, res) => {
  Webhook.sendGrab(req.body.movie.title);
  return res.json({ ok: true });
});

module.exports = router;
