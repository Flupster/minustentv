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

// @route /api/facts
router.get("/", async (req, res) => {
  getRandomFact()
    .then(fact => {
      res.status(200).json(fact);
    })
    .catch(e => {
      console.error("Could not fetch fact", e);
      res.status(200).json({
        on: new Date().toDateString(),
        description: "We could not get a fact from an API :(",
      });
    });
});

module.exports = router;
