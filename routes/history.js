const router = require("express").Router();
const Stream = require("../models/Stream");

const verified = require("../middleware/verified");

//attach verified middleware for verified user access
router.use(verified);

// @route /api/history
router.get("/stream", async (req, res) => {
  const query = Stream.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user" } },
    {
      $group: {
        _id: "$_id",
        user: { $first: "$user.name" },
        date: { $first: "$date" },
        source: { $first: "$inputSource" },
        type: { $first: "$inputType" },
      },
    },
    { $sort: { date: -1 } },
  ]);

  query
    .exec()
    .then(streams => res.status(200).json(streams))
    .catch(error => res.status(500).json({ error }));
});

module.exports = router;
