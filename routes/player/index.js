const router = require("express").Router();
const path = require("path");
const nms = require("../../helpers/nms");

router.ws("/*", (ws, req) => {
  const events = ["streamStart", "streamInfo", "streamEnd"];

  events.forEach(event => {
    const listener = data => ws.json({ event, data });
    nms.on(event, listener);
    ws.on("close", () => nms.off(event, listener));
  });
});

router.get("/*", (req, res) => res.sendFile(path.resolve("dist/index.html")));

module.exports = router;
