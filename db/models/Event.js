const mongoose = require("mongoose");

const Event = new mongoose.Schema({
  eventType: String,
  eventId: String,
  eventData: Object,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Event", Event);
