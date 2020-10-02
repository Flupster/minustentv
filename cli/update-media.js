require("dotenv").config();

const mongoose = require("mongoose");
mongoose.plugin(require("../helpers/createOrUpdate"));

const Media = require("../models/Media");
const Movie = require("../models/Movie");
const TvShow = require("../models/TvShow");

const Meta = require("../helpers/meta");
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
    const doc = await Media.findByFile(file.path);

    // New file
    if (!doc) {
      const meta = await Meta.getMeta(file.path);
      const media = await Media.createOrUpdate({ file: file.path }, meta);
      if (media.tmdb) {
        media.isMovie() ? Movie.updateMovie(media.tmdb.id) : TvShow.updateTvShow(media.tmdb.id);
      }
    } else {
      // File updated
      if (await doc.hasChanged()) {
        const meta = await Meta.getMeta(file.path);
        Media.createOrUpdate({ file: file.path }, meta);
      }

      // Update meta from TMDB
      if (doc.tmdb) {
        doc.isMovie() ? Movie.updateMovie(doc.tmdb.id) : TvShow.updateTvShow(doc.tmdb.id);
      }
    }

    bar.increment();
  }

  bar.stop();
  console.log("All Media Cached!");
  process.exit(0);
}
