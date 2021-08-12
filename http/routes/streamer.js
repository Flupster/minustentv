const axios = require("axios");
const path = require("path");
const StreamModel = require("../../db/models/Stream");
const KillModel = require("../../db/models/Kill");
const YoutubeDlWrap = require("youtube-dl-wrap");
const Stream = require("../../helpers/stream");
const Wss = require("../../helpers/wss");
const Busboy = require("busboy");
const router = require("express").Router();
const canStream = require("../middleware/canStream");
const Media = require("../../db/models/Media");
const Meta = require("../../helpers/meta");
const Webhook = require("../../helpers/webhook");
const websocketStream = require("websocket-stream/stream");
const Searcher = require("../../helpers/searcher");

//attach canStream middleware for verified user access
router.use(canStream);

// /api/streamer/search search for files
router.post("/search", async (req, res) => {
  const search = Searcher.search(req.body.search);

  const media = await Media.find({ file: search });

  const result = search.map(
    (file) => media.find((x) => x.file === file) ?? { file }
  );

  return res.status(200).json(result);
});

// /api/streamer/stream/file stream a file from local fs
router.post("/stream/file", async (req, res) => {
  if (req.body.notifyDiscord) {
    Webhook.send(req.body.file, req.user.username).catch(console.error);
  }

  StartStream(req, res, req.body.file);

  new StreamModel({
    inputType: "file",
    inputSource: req.body.file,
    discordId: req.user.id,
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
    discordId: req.user.id,
  }).save();
});

// /api/streamer/stream/url stream a file from url
router.post("/stream/url", (req, res) => {
  const youtubeDlWrap = new YoutubeDlWrap(
    path.resolve("node_modules/youtube-dl/bin/youtube-dl")
  );
  const video = youtubeDlWrap.execStream([req.body.url, "-f", "best"]);

  youtubeDlWrap.getVideoInfo(req.body.url).then((meta) => {
    Wss.sendJsonPath("/api/streamer", {
      event: "success",
      data: "Playing: " + meta.title ?? "Unknown",
    });
  });

  StartStream(req, res, video);

  new StreamModel({
    inputType: "url",
    inputSource: req.body.url,
    discordId: req.user.id,
  }).save();
});

//Stream killer
router.delete("/:channel", (req, res) => {
  new KillModel({ discordId: req.user.id }).save();

  axios
    .delete(process.env.NMS_URL + "api/streams/live/" + req.params.channel)
    .then((r) => {
      res.status(200).json({ success: "Stream was killed" });
    })
    .catch((e) => {
      res.status(500).json({ error: "Could not kill stream: " + e.message });
    });
});

//Media Info
router.get("/meta", async (req, res) => {
  // REMINDER THIS IS FUCKY AND SOMETIMES DOESN'T UPDATE WHEN MODIFIED TIME IS CHANGED
  const media = await Media.findByFile(req.query.file);
  if (media) {
    return res.status(200).json(media);
  } else {
    const meta = await Meta.getMeta(req.query.file);
    Media.createOrUpdate({ file: req.query.file }, meta);
    return res.status(200).json(meta);
  }
});

router.post("/meta", async (req, res) => {
  const medias = await Media.find({ file: req.body });
  return res.status(200).json(medias);
});

router.ws("/blob", (ws, req) => {
  const stream = websocketStream(ws, {
    binary: true,
  });
  new Stream(stream)
    .on("error", (error) => {
      Wss.sendJsonPath("/api/streamer", {
        event: "error",
        data: error.message,
      });
    })
    .on("stderr", (data) => console.log(data))
    .run();
});

router.ws("/", (req, res) => {});

// Helper function to start streams
function StartStream(req, res, input) {
  const resolution = req.body.resolution ?? 720;
  const stream = new Stream(input)
    .on("progress", (progress) => {
      Wss.sendJsonPath("/api/streamer", { event: "progress", data: progress });
    })
    .on("error", (error) => {
      Wss.sendJsonPath("/api/streamer", {
        event: "error",
        data: error.message,
      });
      if (!res.headersSent) {
        res.status(500).json({ error: error.message.trim() });
      }
    })
    .on("start", (command) => {
      const pid = stream.ffmpegProc.pid;
      Wss.sendJsonPath("/api/streamer", {
        event: "start",
        data: { command, pid },
      });
      if (!res.headersSent) {
        res.status(200).json({ command, pid });
      }
    })
    .addMap("v", req.body.video)
    .addMap("a", req.body.audio)
    .size("?x" + resolution)
    .videoBitrate(resolution > 720 ? 2000 : resolution <= 480 ? 1000 : 1500)
    .on("stderr", (data) => {
      Wss.sendJsonPath("/api/streamer", { event: "log", data });
    });

  if (req.body.start && req.body.start !== "00:00:00") {
    stream.setStartTime(req.body.start);
  }

  if (req.body.subtitle) {
    stream.burnSubs(input, req.body.subtitle);
  }

  stream.run();
  return stream;
}

module.exports = router;
