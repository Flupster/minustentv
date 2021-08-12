const Session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(Session);

const store = new MongoDBStore({
  uri: process.env.DB_CONNECT,
  collection: "sessions",
});

const session = Session({
  name: "sid",
  secret: process.env.TOKEN_SECRET,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
  store,
  resave: true,
  saveUninitialized: true,
});

store.on("error", (e) => console.error("store error", e));

module.exports = session;
