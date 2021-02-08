require("express-async-errors");

const express = require("express");
const path = require("path");
const passport = require("./passport");
const session = require("./session");
const Wss = require("./wss");

const app = express();

// express plugins and helpers
Wss.use(app);
app.enable("trust proxy");
app.use(session);
app.use(passport.initialize());
app.use(passport.session());
// app.use(require("morgan")("combined"));
app.use(express.static(path.join(__dirname, "../dist")));
app.use(express.json({ limit: "1mb" }));
app.use(require("helmet")({ contentSecurityPolicy: false }));
app.use(require("cookie-parser")());
app.use(require("compression")());
app.use("/", require("./routes/index"));
app.use(require("./middleware/error"));

module.exports = app;
