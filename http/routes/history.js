const router = require("express").Router();
const Stream = require("../../db/models/Stream");

const canStream = require("../middleware/canStream");
const Kill = require("../../db/models/Kill");
const discord = require("../../helpers/discord");
const Movie = require("../../db/models/Movie");
const MovieVote = require("../../db/models/MovieVote");
const tmdb = require("../../helpers/tmdb");

//attach canStream middleware for verified user access
router.use(canStream);

// @route /api/history
router.get("/stream", async (req, res) => {
  const streams = await Stream.find({});
  const result = streams.reverse().map(stream => ({
    user: discord.users.cache.get(stream.discordId)?.username,
    ...stream._doc,
  }));

  return res.status(200).json(result);
});

// @route /api/kill
router.get("/kill", async (req, res) => {
  const query = Kill.aggregate([
    {
      $lookup: { from: "users", localField: "discordId", foreignField: "id", as: "user" },
    },
    {
      $unwind: { path: "$user" },
    },
    {
      $group: {
        _id: "$_id",
        user: { $first: "$user.username" },
        date: { $first: "$date" },
      },
    },
    { $sort: { date: -1 } },
  ]);

  query
    .exec()
    .then(streams => res.status(200).json(streams))
    .catch(error => res.status(500).json({ error }));
});

// @route /api/vote
router.get("/vote", async (req, res) => {
  const _votes = await MovieVote.find({});
  const _movies = await Movie.find({ id: _votes.map(v => v.movieId) });

  const votes = _votes.reverse().map(v => ({
    user: discord.users.cache.get(v.discordId)?.username,
    movie: _movies.find(m => m.id === v.movieId)?.title,
    vote: v.vote,
    date: v.updatedAt,
  }));

  return res.status(200).json(votes);
});

module.exports = router;
