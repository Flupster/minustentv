const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  eventType: String,
  eventId: String,
  eventData: Object,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Event", EventSchema);
