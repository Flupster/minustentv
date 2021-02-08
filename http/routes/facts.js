const router = require("express").Router();
const Axios = require("axios");
const axios = Axios.create({ baseURL: "https://byabbe.se/on-this-day/" });
const facts = {};

async function getRandomFact() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (!facts[now.getTime()]) {
    const res = await axios.get(`${now.getMonth() + 1}/${now.getDate()}/events.json`);
    facts[now.getTime()] = res.data;
  }

  const events = facts[now.getTime()];
  const event = events.events[Math.floor(Math.random() * events.events.length)];

  return {
    on: [events.date, event.year].join(", "),
    description: event.description,
  };
}

async function getDadJoke() {
  const joke = await Axios.get("https://icanhazdadjoke.com/", {
    headers: { "Content-Type": "application/json" },
  });

  return { text: req.data.joke };
}

async function getUselessFact() {
  const req = await Axios.get("https://api.kanye.rest/");
  return { text: req.data.quote + " - Kanye West" };
}

// @route /api/facts
router.get("/", async (req, res) => {
  getDadJoke()
    .then(joke => res.status(200).json(joke))
    .catch(e => {
      console.error("Could not fetch fact", e);
      res.status(200).json({ text: "Sometimes Floppy sucks and causes an error in the API!" });
    });
});

module.exports = router;
