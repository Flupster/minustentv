const discord = require("../../helpers/discord");

// Middleware for discord users who can stream
const canStream = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(400).json({ error: "User is not logged in" });
  }

  const user = await discord.guilds.cache.get(process.env.DISCORD_GUILD).members.fetch(req.user.id);
  if (!user) {
    return res.status(400).json({ error: "User is not in the discord guild" });
  }

  const hasRole = user.roles.cache.find(role => role.id === process.env.DISCORD_STREAM_ROLE);
  if (!hasRole) {
    return res.status(400).json({ error: "User is not in the streamer role" });
  }

  next();
};

module.exports = canStream;
