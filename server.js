require("express-async-errors");
require("dotenv").config();
const express = require("express");
const Wss = require("./helpers/wss");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const discord = require("./discord");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const { passport, session, authRoutes } = require("./discord-oauth");

const app = express();
Wss.use(app);

app.enable("trust proxy");
app.use(session);
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan("combined"));
app.use(express.static("dist"));
app.use(express.static("public"));
app.use(express.json({ limit: "10kb" }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cookieParser());
app.use(compression());
app.use(authRoutes);
app.use("/", require("./routes/index"));
app.use(require("./middleware/error"));

// connect to DB
mongoose
  .connect(process.env.DB_CONNECT, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Mongodb connection successful"))
  .catch(console.error);

discord.on("ready", async () => {
  console.log("Discord bot logged in");
  const guild = discord.guilds.cache.get(process.env.DISCORD_GUILD);
  guild.members.fetch();
});

app.listen(5000, () => console.log("Webserver listening"));
