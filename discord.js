const Discord = require("discord.js");
const client = new Discord.Client();

client.login(process.env.DISCORD_TOKEN);

module.exports = client;
