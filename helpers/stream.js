const Ffmpeg = require("fluent-ffmpeg");

class Stream extends Ffmpeg {
  constructor(input) {
    super(input);
    this.native()
      .videoCodec("libx264")
      .audioCodec("aac")
      .audioChannels(2)
      .audioFrequency(44100)
      .flvmeta()
      .format("flv")
      .output(process.env.NMS_RTMP_URL);
  }

  addMap(type, index) {
    if (index === undefined) {
      this.outputOption(`-map 0:${type}`);
    } else {
      this.outputOption(`-map 0:${type}:${index}`);
    }

    return this;
  }

  burnSubs(input, index, fontsize = 24) {
    if (index > 0) {
      input = input + ":si=" + index;
    }

    this.videoFilters([
      {
        filter: "subtitles",
        options: [input, `force_style='Fontsize=${fontsize}'`],
      },
    ]);

    return this;
  }
}

module.exports = Stream;
