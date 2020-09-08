<template>
  <div id="wrapper">
    <video id="video" class="video-js" preload="auto" controls></video>
  </div>
</template>

<style>
.vjs-control-bar {
  background-color: rgb(0 0 0 / 70%) !important;
}

.video-js.vjs-playing .vjs-tech {
  pointer-events: none;
}
</style>

<style scoped>
@import "video.js/dist/video-js.css";
@import "toastr";

body {
  overflow: hidden;
}

.video-dimensions {
  width: 100%;
  height: 100%;
}

#video {
  position: inherit !important;
}

#wrapper {
  margin: 0vh;
  border: 0px;
  padding: 0px;
  height: 100vh;
  background-color: black;
}

video {
  width: 100%;
  height: 100%;
  max-height: 100vh;
}
</style>

<script>
import toastr from "toastr";
import videojs from "video.js";
import "videojs-flvjs-es6";

export default {
  data() {
    return {
      channel: "mtv",
      wss: null,
      player: null,
    };
  },
  methods: {
    play(src) {
      if (!src) {
        this.player.src({
          type: "video/x-flv",
          src: `${process.env.NMS_URL}live/${this.channel}.flv`,
        });
      } else {
        this.player.src(src);
      }

      this.player.play().catch((e) => {
        if (e.message.includes("user didn't interact with the document")) {
          videojs.log("Attempting to mute and play due to interact error");
          this.player.muted(true);
          this.player.play();
        } else {
          videojs.log(e);
        }
      });
    },
    onMessage(message) {
      const json = JSON.parse(message.data);
      this.$emit(json.event, json.data);
    },
    seekToLive() {
      const currentTime = this.player.currentTime();
      const liveTime = this.player.liveTracker.liveCurrentTime();
      const behind = liveTime - currentTime;
      if (behind > 3 && behind !== Infinity) {
        this.player.currentTime(liveTime - 3);
      }
    },
  },
  mounted() {
    //Websocket for events
    this.wss = new WebSocket(process.env.WSS_URL + this.channel);
    this.wss.onmessage = this.onMessage;

    // On streamStart play stream
    this.$on("streamStart", (data) => {
      if (this.channel === data.channel) {
        toastr.success("Stream is starting!");
        this.play();
      }
    });

    //on streamEnd stop stream
    this.$on("streamEnd", (data) => {
      if (this.channel === data.channel) {
        toastr.error("Stream has ended!");
        this.player.pause();
        this.player.src("");
      }
    });

    this.player = videojs("video", {
      techOrder: ["flvjs"],
      flvjs: {
        mediaDataSource: {
          isLive: true,
          cors: true,
          withCredentials: false,
        },
      },
    });

    // Handle double click fullscreen
    this.player.on("dblclick", () => {
      if (this.player.isFullscreen()) {
        this.player.exitFullscreen();
      } else {
        this.player.requestFullscreen();
      }
    });

    // Remember volume
    this.player.on("volumechange", (x) => {
      if (!this.player.muted()) {
        localStorage.setItem("player-volume", this.player.volume());
      }
    });

    // On play seek to live
    this.player.on("play", () => {
      this.seekToLive();
      this.player.volume(localStorage.getItem("player-volume") ?? 1);
    });

    // Play when ready
    this.player.on("ready", () => this.play());
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  },
};
</script>