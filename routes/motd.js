const router = require("express").Router();
const Axios = require("axios");

async function getDadJoke() {
  const req = await Axios.get("https://icanhazdadjoke.com/", {
    headers: { Accept: "application/json" },
  });

  return { text: req.data.joke };
}

// @route /api/motd
router.get("/", async (req, res) => {
  getDadJoke()
    .then(text => res.status(200).json(text))
    .catch(e => {
      res.status(200).json({ text: "What do you get when Floppy fails to receive a joke from the API?... this." });
    });
});

module.exports = router;
