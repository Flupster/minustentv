<template>
  <div id="wrapper">
    <video id="video" class="video-js" preload="auto" controls></video>
  </div>
</template>

<style>
.video-js {
  font-size: 15px !important;
}

.vjs-control-bar {
  background-color: rgb(0 0 0 / 50%) !important;
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
import ReconnectingWebSocket from "reconnecting-websocket";

export default {
  data() {
    return {
      noInteract: false,
      channel: "mtv",
      meta: {},
      ws: null,
      player: null,
    };
  },
  watch: {
    meta: {
      handler(meta, oldMeta) {
        //on meta event
      },
      deep: true,
    },
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
          this.noInteract = true;
          toastr.info("Click the video to unmute!");
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
    this.ws = new ReconnectingWebSocket(process.env.WSS_URL + this.channel);
    this.ws.onmessage = this.onMessage;

    this.$on("streamInfo", (data) => {
      if (this.channel === data.channel) {
        this.meta = data.meta;
      }
    });

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

    // If player is muted due to non interaction error unmute on click
    this.player.on("click", () => {
      if (this.noInteract) {
        this.noInteract = false;
        this.player.muted(false);
      }
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