require("dotenv").config();

const mongoose = require("mongoose");
mongoose.plugin(require("../helpers/createOrUpdate"));

const Media = require("../models/Media");
const Movie = require("../models/Movie");
const TvShow = require("../models/TvShow");

const Meta = require("../helpers/meta");
const Searcher = require("../helpers/searcher");
const cliProgress = require("cli-progress");

Searcher.watcher.on("ready", () => {
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
});

async function start() {
  const files = Searcher.files;

  const bar = new cliProgress.SingleBar({ hideCursor: true }, cliProgress.Presets.shades_classic);
  bar.start(files.length, 0);

  for (const file of files) {
    const doc = await Media.findByFile(file);

    // New file
    if (!doc) {
      const meta = await Meta.getMeta(file);
      const media = await Media.createOrUpdate({ file }, meta);
      if (media.tmdb) {
        media.isMovie() ? Movie.updateMovie(media.tmdb.id) : TvShow.updateTvShow(media.tmdb.id);
      }
    } else {
      // File updated
      if (await doc.hasChanged()) {
        const meta = await Meta.getMeta(file);
        Media.createOrUpdate({ file }, meta);
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
