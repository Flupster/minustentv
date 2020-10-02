const mongoose = require("mongoose");
const Tmdb = require("../helpers/tmdb");

const Movie = new mongoose.Schema(
  {
    id: { type: Number, index: true },
    date: { type: Date, default: Date.now },
    adult: Boolean,
    backdrop_path: String,
    belongs_to_collection: Object,
    budget: Number,
    genres: Array,
    homepage: String,
    imdb_id: String,
    original_language: String,
    original_title: String,
    overview: String,
    popularity: Number,
    poster_path: String,
    production_companies: Array,
    production_countries: Array,
    release_date: Date,
    revenue: Number,
    runtime: Number,
    spoken_languages: Array,
    status: String,
    tagline: String,
    title: String,
    video: Boolean,
    vote_average: Number,
    vote_count: Number,
  },
  { timestamps: true }
);

Movie.statics.updateMovie = async function(id) {
  const doc = await this.findOne({ id });
  if (doc && new Date() - doc.date < 8.64e7) return doc;

  return this.forceUpdateMovie(id);
};

Movie.statics.forceUpdateMovie = async function(id) {
  const req = await Tmdb.get(`/movie/${id}`);
  return this.createOrUpdate({ id }, req.data);
};

module.exports = mongoose.model("Movie", Movie);
