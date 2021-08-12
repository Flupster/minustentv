const fs = require("fs");
const oleoo = require("oleoo");
const ffmpeg = require("fluent-ffmpeg");
const axios = require("axios");
const path = require("path");
const Movie = require("../db/models/Movie");
const TvShow = require("../db/models/TvShow");

const TmdbInstance = axios.create({
  baseURL: "https://api.themoviedb.org/3/",
  params: { api_key: process.env.TMDB_API_KEY },
});

exports.getSceneInfo = function(file) {
  return oleoo.parse(path.parse(file).name);
};

exports.getMediaInfo = function(file) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(file, (e, r) => (e ? reject(e) : resolve(r)));
  });
};

exports.getTMDB = async function(file) {
  const scene = this.getSceneInfo(file);
  const category = scene.type === "movie" ? "movie" : "tv";
  const request = await TmdbInstance.get("/search/" + category, {
    params: { query: scene.title, year: scene.year },
  });

  return request.data.results[0];
};

exports.getMeta = async function(file) {
  const stat = fs.statSync(file);
  const scene = this.getSceneInfo(file);
  const mediainfo = await this.getMediaInfo(file);
  const tmdb = await this.getTMDB(file);

  return { modified: stat.mtime, file, scene, mediainfo, tmdb };
};
