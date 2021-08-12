const Discord = require("discord.js");
const client = new Discord.Client();

client.login(process.env.DISCORD_TOKEN);

// Load guild members
client.on("ready", async () => {
  console.log("Discord Ready");
  const guild = client.guilds.cache.get(process.env.DISCORD_GUILD);
  guild.members.fetch();
});

module.exports = client;
