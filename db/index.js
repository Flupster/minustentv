const mongoose = require("mongoose");

mongoose.plugin(require("./plugins/createOrUpdate"));

mongoose
  .connect(process.env.DB_CONNECT, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Mongodb connection successful"))
  .catch(console.error);

// mongoose.set("debug", true);

module.exports = mongoose;
