const Emitter = require("events");
const Event = require("../models/Event");
const axios = require("axios");

class Nms extends Emitter {
  constructor() {
    super();
    this.channels = {};
  }

  onEvent(eventType, body) {
    const event = new Event({
      eventType,
      eventId: body[0],
    });

    if (body.length === 3) {
      event.eventData = { streamPath: body[1], ...body[2] };
    } else {
      event.eventData = { ...body[1] };
    }

    event.save();

    switch (eventType) {
      case "postConnect":
        if (body[1].streamPath) {
          this.getStreamInfo(body[1].streamPath.split("/").pop());
        }
        break;
      case "doneConnect":
        if (body[1].streamPath) {
          this.getStreamInfo(body[1].streamPath.split("/").pop());
        }
        break;
      case "postPublish":
        this.emit("streamStart", {
          channel: body[1].split("/").pop(),
        });
        break;
      case "donePublish":
        this.emit("streamEnd", {
          channel: body[1].split("/").pop(),
        });
        break;
    }
  }

  async getStreamInfo(channel) {
    try {
      const req = await axios.get(
        process.env.NMS_URL + "api/streams/live/" + channel
      );
      this.channels[channel] = req.data;
      this.emit("streamInfo", { channel, meta: req.data });
      return req.data;
    } catch (ex) {
      return ex;
    }
  }
}

module.exports = new Nms();
