require("dotenv").config();
const mongoose = require("mongoose");
const meta = require("../helpers/meta");
const Media = require("../models/Media");
const rrdir = require("rrdir");
const cliProgress = require("cli-progress");

mongoose
  .connect(process.env.DB_CONNECT, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(start)
  .catch(e => {
    console.error(e);
    process.exit(1);
  });

async function start() {
  const files = await rrdir.async(process.env.MEDIA_DIR, {
    exclude: ["**/.*"],
    include: [process.env.MEDIA_GLOB],
  });

  const bar = new cliProgress.SingleBar({ hideCursor: true }, cliProgress.Presets.shades_classic);
  bar.start(files.length, 0);

  for (const file of files) {
    if (await Media.findByFile(file.path)) {
      bar.increment();
      continue;
    }

    try {
      const media = await meta.getMeta(file.path);
      new Media(media).save();
      bar.increment();
    } catch (e) {
      console.log(e);
      process.exit(1);
    }
  }

  bar.stop();
  console.log("All Media Cached!");
  process.exit(0);
}
