const router = require("express").Router();

router.use("/api/user", require("./user"));
router.use("/api/nms", require("./nms"));
router.use("/api/streamer", require("./streamer"));
router.use("/api/history", require("./history"));
router.use("/api/facts", require("./facts"));
router.use("/", require("./player"));

module.exports = router;
