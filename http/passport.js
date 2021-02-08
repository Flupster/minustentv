const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const User = require("../db/models/User");

const StrategyOptions = {
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ["identify"],
};

const StrategyLogin = (accessToken, refreshToken, profile, cb) => {
  profile.refreshToken = refreshToken;
  cb(null, profile);
  User.createOrUpdate({ id: profile.id }, profile);
};

const Strategy = new DiscordStrategy(StrategyOptions, StrategyLogin);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
passport.use(Strategy);

module.exports = passport;
