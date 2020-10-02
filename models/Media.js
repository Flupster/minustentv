const mongoose = require("mongoose");
const fs = require("fs");

const Media = new mongoose.Schema({
  file: { type: String, index: true },
  modified: Date,
  scene: Object,
  mediainfo: Object,
  tmdb: Object,
  date: { type: Date, default: Date.now },
});

Media.statics.findByFile = async function(file) {
  const stat = fs.statSync(file);
  const doc = await this.findOne({ file });

  if (!doc || doc.modified.getTime() !== stat.mtime.getTime()) return null;
  else return doc;
};

Media.methods.hasChanged = async function() {
  const stat = fs.statSync(this.file);
  return this.modified.getTime() !== stat.mtime.getTime();
};

Media.methods.isMovie = function() {
  return this.scene.type === "movie";
};

Media.methods.isTvShow = function() {
  return this.scene.type === "tvshow";
};

module.exports = mongoose.model("Media", Media);
