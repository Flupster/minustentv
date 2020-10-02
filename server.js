require("express-async-errors");
require("dotenv").config();

// mongo db init
const mongoose = require("mongoose");
mongoose.plugin(require("./helpers/createOrUpdate"));

mongoose
  .connect(process.env.DB_CONNECT, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Mongodb connection successful"))
  .catch(console.error);

// express init
const express = require("express");
const passport = require("./passport");
const session = require("./session");
const Wss = require("./helpers/wss");
const app = express();

// express plugins and helpers
Wss.use(app);
app.enable("trust proxy");
app.use(session);
app.use(passport.initialize());
app.use(passport.session());
app.use(require("morgan")("combined"));
app.use(express.static("dist"));
app.use(express.static("public"));
app.use(express.json({ limit: "10kb" }));
app.use(require("helmet")({ contentSecurityPolicy: false }));
app.use(require("cookie-parser")());
app.use(require("compression")());
app.use("/", require("./routes/index"));
app.use(require("./middleware/error"));
app.listen(5000, () => console.log("Webserver listening"));

// discord init
const discord = require("./discord");
discord.on("ready", async () => {
  console.log("Discord bot logged in");
  const guild = discord.guilds.cache.get(process.env.DISCORD_GUILD);
  guild.members.fetch();
});
