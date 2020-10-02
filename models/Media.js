const mongoose = require("mongoose");
const fs = require("fs");

const MediaSchema = new mongoose.Schema({
  file: { type: String, index: true },
  modified: Date,
  scene: Object,
  mediainfo: Object,
  tmdb: Object,
  date: { type: Date, default: Date.now },
});

MediaSchema.statics.findByFile = async function(file) {
  const stat = fs.statSync(file);
  const doc = await this.findOne({ file });

  if (!doc || doc.modified.getTime() !== stat.mtime.getTime()) return null;
  else return doc;
};

module.exports = mongoose.model("Media", MediaSchema);
