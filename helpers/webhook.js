const Discord = require("discord.js");
const Media = require("../models/Media");

const hook = new Discord.WebhookClient(process.env.DISCORD_WEBHOOK_ID, process.env.DISCORD_WEBHOOK_KEY);

exports.send = async function(file, issuer) {
  const doc = await Media.findOne({ file });
  if (!doc || !doc.tmdb) {
    throw "Could not find meta for file: " + file;
  }

  let title;

  if (doc.scene.type === "tvshow") {
    const season = String(doc.scene.season).padStart(2, "0");
    const episode = String(doc.scene.episode).padStart(2, "0");
    title = doc.tmdb.name + ` S${season}E${episode}`;
  } else {
    title = doc.tmdb.title;
  }

  if (doc.scene.year) title += ` (${doc.scene.year})`;

  const embed = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle(title)
    .setURL("https://minusten.tv/")
    .setThumbnail("https://image.tmdb.org/t/p/original" + doc.tmdb.poster_path)
    .addFields([
      { name: "Plot", value: `||${doc.tmdb.overview}||` },
      { name: "Rating", value: `${doc.tmdb.vote_average} / 10`, inline: true },
      { name: "Blazed By", value: issuer, inline: true },
    ])
    .setTimestamp();

  return hook.send(embed);
};
