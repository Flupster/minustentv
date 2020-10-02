const router = require("express").Router();
const passport = require("../passport");

router.get("/discord", passport.authenticate("discord"), (req, res) => res.redirect("/streamer"));
router.get("/login", passport.authenticate("discord"));
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
