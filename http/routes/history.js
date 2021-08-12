const router = require("express").Router();
const Stream = require("../../db/models/Stream");
const Cache = require("../../cache");

const canStream = require("../middleware/canStream");

//attach canStream middleware for verified user access
// router.use(canStream);

// @route /api/history
router.get("/stream", async (req, res) => {
  const cached = await Cache.get('history:stream');
  if (cached) return res.status(200).json(JSON.parse(cached));

  const query = Stream.aggregate([
    {
      $lookup: { from: "users", localField: "discordId", foreignField: "id", as: "user" },
    },
    {
      $unwind: { path: "$user" },
    },
    {
      $lookup: { from: "media", localField: "inputSource", foreignField: "file", as: "meta" }
    },
    {
      $unwind: { path: "$meta" },
    },
    {
      $group: {
        _id: "$_id",
        user: { $first: "$user.username" },
        discordAvatar: { $first: "$user.avatar" },
        discordId: { $first: "$user.id" },
        date: { $first: "$date" },
        source: { $first: "$inputSource" },
        type: { $first: "$inputType" },
        meta: { $first: "$meta.tmdb" },
        scene: { $first: "$meta.scene" },
      },
    },
    { $sort: { date: -1 } },
  ]);

  query
    .exec()
    .then(streams => {
      Cache.set('history:stream', JSON.stringify(streams));
      return res.status(200).json(streams)
    })
    .catch(error => res.status(500).json({ error }));
});

module.exports = router;
