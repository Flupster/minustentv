const Fuse = require("fuse.js");
const chokidar = require("chokidar");
const Media = require("../db/models/Media");
const Meta = require("./meta");

class Searcher {
  constructor() {
    this.files = [];
    this.watcher = chokidar.watch(process.env.MEDIA_GLOB);
    this.watcher.on("add", this.onNewFile.bind(this));
    this.watcher.on("ready", () => console.log("Searcher is ready..."));
  }

  search(term) {
    const fuse = new Fuse(this.files);
    const search = fuse.search(term).splice(0, 100);
    return search.map(x => x.item);
  }

  async onNewFile(file) {
    this.files.push(file);

    const media = await Media.findByFile(file);

    if (!media) {
      const meta = await Meta.getMeta(file);
      await Media.createOrUpdate({ file }, meta);

      if (meta.scene.type === "tvshow") {
        console.log("Matched TV:", file, "=>", meta.tmdb?.name);
      } else if (meta.scene.type === "movie") {
        console.log("Matched Movie:", file, "=>", meta.tmdb?.title);
      }
    }
  }
}

module.exports = new Searcher();
