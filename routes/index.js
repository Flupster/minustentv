const router = require("express").Router();

router.use("/api/user", require("./user/index"));
router.use("/api/auth", require("./auth/index"));
router.use("/api/nms", require("./nms/index"));
router.use("/api/streamer", require("./streamer/index"));
router.use("/", require("./player"));

module.exports = router;
