require("dotenv").config();
require("./db");
require("./helpers/discord");

const app = require("./http");
app.listen(5000, () => console.log("Webserver listening"));
