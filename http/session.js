const Session = require("express-session");
const MongoStore = require("connect-mongo")(Session);
const mongoose = require("../db");

const store = new MongoStore({ mongooseConnection: mongoose.connection });

const session = Session({
  name: "sid",
  secret: process.env.TOKEN_SECRET,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
  store,
  resave: true,
  saveUninitialized: true,
});

store.on("error", e => console.error("store error", e));

module.exports = session;
