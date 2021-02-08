const mongoose = require("mongoose");

mongoose.plugin(require("./plugins/createOrUpdate"));

// mongoose.set("debug", true);

module.exports = mongoose;
