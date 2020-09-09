const router = require("express").Router();
const path = require("path");
const nms = require("../../helpers/nms");

router.ws("/*", (ws, req) => {
  const events = ["streamStart", "streamInfo", "streamEnd"];

  events.forEach(event => {
    function eventHandler(data) {
      ws.json({ event, data });
    }

    nms.on(event, eventHandler);
    ws.on("close", () => nms.off(event, eventHandler));
  });
});

router.get("/*", (req, res) => res.sendFile(path.resolve("dist/index.html")));

module.exports = router;
