const router = require("express").Router();
const path = require("path");
const nms = require("../../helpers/nms");

router.ws("/*", (ws, req) => {
  // Send a ping every 10s
  setInterval(() => ws.event("ping", +new Date()), 10000);

  ws.on("message", message => {
    console.log(req.ip, message);
  });

  const events = ["streamStart", "streamInfo", "streamEnd"];

  events.forEach(event => {
    function eventHandler(data) {
      ws.event(event, data);
    }

    nms.on(event, eventHandler);
    ws.on("close", () => nms.off(event, eventHandler));
  });
});

router.get("/*", (req, res) => res.sendFile(path.resolve("dist/index.html")));

module.exports = router;
