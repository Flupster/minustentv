const mongoose = require("mongoose");
const Tmdb = require("../../helpers/tmdb");

const TvShow = new mongoose.Schema(
  {
    id: { type: Number, index: true },
    date: { type: Date, default: Date.now },
    backdrop_path: String,
    created_by: Object,
    episode_run_time: [Number],
    first_air_date: Date,
    genres: Object,
    homepage: String,
    in_production: Boolean,
    languages: [String],
    last_air_date: Date,
    last_episode_to_air: Object,
    name: String,
    networks: Object,
    number_of_episodes: Number,
    number_of_seasons: Number,
    origin_country: [String],
    original_language: String,
    original_name: String,
    overview: String,
    popularity: Number,
    poster_path: String,
    production_companies: Object,
    seasons: Object,
    status: String,
    type: String,
    vote_average: Number,
    vote_count: Number,
  },
  { timestamps: true }
);

TvShow.statics.updateTvShow = async function(id) {
  const doc = await this.findOne({ id });
  if (doc && new Date() - doc.date < 8.64e7) return doc;

  return this.forceUpdateTvShow(id);
};

TvShow.statics.forceUpdateTvShow = async function(id) {
  const req = await Tmdb.get(`/tv/${id}`);
  return this.createOrUpdate({ id }, req.data);
};

module.exports = mongoose.model("TvShow", TvShow);
