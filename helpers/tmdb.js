const Axios = require("axios");

module.exports = Axios.create({
  baseURL: "https://api.themoviedb.org/3/",
  params: { api_key: process.env.TMDB_API_KEY },
});
