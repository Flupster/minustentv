const router = require("express").Router();
const discord = require("../../helpers/discord");
const Joke = require("../../db/models/Joke");
const ipmw = require("../middleware/ip")(process.env.IPMW_JOKES);

// @route /api/jokes
router.get("/", async (req, res) => {
  const joke = await Joke.aggregate().sample(1);
  return res.json(joke[0]);
});

router.get("/motd", async (req, res) => {
  const joke = await Joke.aggregate().sample(1);
  if (joke.length === 0) {
    return res.json({ text: "The joke is there is no jokes..." });
  }

  const user = await discord.users.fetch(joke[0].discordId);
  return res.json({ text: `${joke[0].joke} - ${user.username}` });
});

router.get("/:discordId", async (req, res) => {
  const discordId = req.params.discordId;
  const jokes = await Joke.find({ discordId });
  return res.json(jokes);
});

router.post("/:discordId", ipmw, async (req, res) => {
  const joke = req.body.joke;
  const discordId = req.params.discordId;

  if (joke.length >= 255) {
    return res.status(400).json({ message: "Joke was too long" });
  }

  const count = await Joke.countDocuments({ discordId });
  if (count >= 5) return res.status(400).json({ message: "Too many jokes" });

  await Joke.create({ joke, discordId });
  return res.json({ success: true });
});

router.delete("/:discordId", ipmw, async (req, res) => {
  const discordId = req.params.discordId;

  await Joke.deleteMany({ discordId });
  return res.json({ success: true });
});

module.exports = router;
