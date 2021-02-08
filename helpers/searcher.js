const Fuse = require("fuse.js");
const chokidar = require("chokidar");

class Searcher {
  constructor() {
    this.files = [];
    this.watcher = chokidar.watch(process.env.MEDIA_GLOB);
    this.watcher.on("add", file => this.files.push(file));
    this.watcher.on("ready", () => console.log("Searcher is ready..."));
  }

  search(term) {
    const fuse = new Fuse(this.files);
    const search = fuse.search(term).splice(0, 100);
    return search.map(x => x.item);
  }
}

module.exports = new Searcher();
