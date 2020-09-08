require("express-async-errors");
require("dotenv").config();
const express = require("express");
const Wss = require("./helpers/wss");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const app = express();
Wss.use(app);

app.use(morgan("combined"));
app.use(express.static("dist"));
app.use(express.json({ limit: "10kb" }));
app.use(helmet());
app.use(cookieParser());
app.use(compression());
app.use("/", require("./routes/index"));
app.use(require("./middleware/error"));

// connect to DB
mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongodb connection successful");
  })
  .catch(console.error);

// start server
app.listen(5000, () => {
  console.log("Server listening on 0.0.0.0:5000");
});
