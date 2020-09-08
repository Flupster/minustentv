const Ffmpeg = require("fluent-ffmpeg");

class Stream extends Ffmpeg {
  constructor(input) {
    super(input);
    this.native()
      .videoCodec("libx264")
      .audioCodec("aac")
      .videoBitrate(2000)
      .audioChannels(2)
      .audioFrequency(44100)
      .size("?x720")
      .flvmeta()
      .format("flv")
      .output(process.env.NMS_RTMP_URL);
  }
}

module.exports = Stream;
