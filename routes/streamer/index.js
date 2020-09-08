const rrdir = require("rrdir");
const Fuse = require("fuse.js");
const axios = require("axios");
const path = require("path");
const StreamModel = require("../../models/Stream");
const YoutubeDlWrap = require("youtube-dl-wrap");
const Stream = require("../../helpers/stream");
const Wss = require("../../helpers/wss");
const Busboy = require("busboy");
const router = require("express").Router();
const verified = require("../../middleware/verified");

//attach verified middleware for verified user access
router.use(verified);

// /api/streamer/search search for files
router.post("/search", async (req, res) => {
  rrdir
    .async(process.env.MEDIA_DIR, {
      exclude: ["**/.*"],
      include: [process.env.MEDIA_GLOB],
    })
    .then(files => {
      const fuse = new Fuse(files.map(f => f.path));
      const search = fuse.search(req.body.search);
      res.status(200).json(search.map(s => s.item));
    });
});

// /api/streamer/stream/file stream a file from local fs
router.post("/stream/file", async (req, res) => {
  StartStream(req, res, req.body.file);

  new StreamModel({
    inputType: "file",
    inputSource: req.body.file,
    userId: req.user._id,
  }).save();
});

// /api/streamer/stream/upload stream a file from uploaded file
router.post("/stream/upload", (req, res) => {
  const busboy = new Busboy({ headers: req.headers });
  busboy.on("file", (field, file) => StartStream(req, res, file));

  busboy.on("finish", () => {
    res.status(200).send({ message: "Success" });
  });

  req.pipe(busboy);

  new StreamModel({
    inputType: "upload",
    inputSource: null,
    userId: req.user._id,
  }).save();
});

// /api/streamer/stream/url stream a file from url
router.post("/stream/url", (req, res) => {
  const youtubeDlWrap = new YoutubeDlWrap(
    path.resolve("node_modules/youtube-dl/bin/youtube-dl")
  );
  const video = youtubeDlWrap.execStream([req.body.url, "-f", "best"]);

  youtubeDlWrap.getVideoInfo(req.body.url).then(meta => {
    Wss.sendJsonPath("/api/streamer", {
      event: "success",
      data: "Playing: " + meta.title ?? "Unknown",
    });
  });

  StartStream(req, res, video);

  new StreamModel({
    inputType: "url",
    inputSource: req.body.url,
    userId: req.user._id,
  }).save();
});

// Helper function to start streams
function StartStream(req, res, input) {
  const stream = new Stream(input)
    .on("progress", progress => {
      Wss.sendJsonPath("/api/streamer", { event: "progress", data: progress });
    })
    .on("error", error => {
      Wss.sendJsonPath("/api/streamer", {
        event: "error",
        data: error.message,
      });
      if (!res.headersSent) {
        res.status(500).json({ error: error.message.trim() });
      }
    })
    .on("start", command => {
      const pid = stream.ffmpegProc.pid;
      Wss.sendJsonPath("/api/streamer", {
        event: "start",
        data: { command, pid },
      });
      if (!res.headersSent) {
        res.status(200).json({ command, pid });
      }
    });

  if (req.body.start && req.body.start !== "00:00:00") {
    stream.setStartTime(req.body.start);
  }

  stream.run();
  return stream;
}

//Stream killer
router.delete("/:channel", (req, res) => {
  axios
    .delete(process.env.NMS_URL + "api/streams/live/" + req.params.channel)
    .then(r => {
      res.status(200).json({ success: "Stream was killed" });
    })
    .catch(e => {
      res.status(500).json({ error: "Could not kill stream: " + e.message });
    });
});

router.ws("/");

module.exports = router;
