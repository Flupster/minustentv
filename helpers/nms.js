const Emitter = require("events");
const axios = require("axios");

class Nms extends Emitter {
  constructor() {
    super();
    this.channels = {};
  }

  onEvent(event, data) {
    switch (event) {
      case "postConnect":
        if (data[1].streamPath) {
          this.getStreamInfo(data[1].streamPath.split("/").pop());
        }
        break;
      case "doneConnect":
        if (data[1].streamPath) {
          this.getStreamInfo(data[1].streamPath.split("/").pop());
        }
        break;
      case "postPublish":
        this.emit("streamStart", {
          channel: data[1].split("/").pop(),
        });
        break;
      case "donePublish":
        this.emit("streamEnd", {
          channel: data[1].split("/").pop(),
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
