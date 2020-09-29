const router = require("express").Router();
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const Refresh = require("passport-oauth2-refresh");
const Session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(Session);
const User = require("./models/User");

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

const StrategyOptions = {
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ["identify"],
};

const StrategyLogin = (accessToken, refreshToken, profile, cb) => {
  profile.refreshToken = refreshToken;

  User.findOne({ id: profile.id }).then(user => {
    if (user) User.updateOne(user, profile);
    else new User(profile).save();
  });

  cb(null, profile);
};

const Strategy = new DiscordStrategy(StrategyOptions, StrategyLogin);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
passport.use(Strategy);
Refresh.use(Strategy);

store.on("error", e => console.error("store error", e));

router.get("/auth/discord", passport.authenticate("discord"), (req, res) => res.redirect("/streamer"));
router.get("/auth/login", passport.authenticate("discord"));
router.get("/auth/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = { passport, session, authRoutes: router };
