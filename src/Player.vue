<template>
  <div class="h-100 black-bg">
    <!-- settings modal -->
    <div>
      <b-modal
        content-class="settings-modal"
        v-if="player"
        ref="settings-modal"
        title="Settings / Info"
        hide-footer
        centered
      >
        <b-row>
          <b-col md="12" class="text-center font-weight-bold mb-2">Sync Settings</b-col>
          <b-col md="1">
            <b-form-checkbox v-model="syncerSettings.enabled" name="check-button" switch></b-form-checkbox>
          </b-col>
          <b-col>
            <b-form-input style="direction: rtl" v-model="syncerSettings.intensity" type="range" min="1" max="100">
            </b-form-input>
          </b-col>
        </b-row>

        <table class="table table-sm table-borderless settings-table mt-2">
          <tbody>
            <tr>
              <th scope="row">Sync Intensity:</th>
              <td colspan="2">{{ Math.abs(this.syncer.intensity - 100).toFixed(1) }}</td>
            </tr>
            <tr>
              <th scope="row">Time/Live Time:</th>
              <td>{{ this.player.currentTime().toFixed(3) }}</td>
              <td>{{ this.player.liveTracker.liveCurrentTime().toFixed(3) }}</td>
            </tr>
            <tr>
              <th scope="row">Behind Live:</th>
              <td>{{ (this.player.liveTracker.liveCurrentTime() - this.player.currentTime()).toFixed(3) }}</td>
              <td>{{ this.syncer.average.toFixed(3) }}</td>
            </tr>
            <tr>
              <th scope="row">Sync Deviation:</th>
              <td>{{ Math.round(this.syncer.deviation * 1000) }} ms</td>
              <td>{{ Math.round(this.syncer.averageDeviation * 1000) }} ms</td>
            </tr>
            <tr>
              <th scope="row">Last Chunk:</th>
              <td colspan="2">{{ this.player.liveTracker.pastSeekEnd().toFixed(3) }}</td>
            </tr>
            <tr>
              <th scope="row">Playback Rate:</th>
              <td colspan="2">{{ this.player.playbackRate().toFixed(3) }}</td>
            </tr>
            <tr>
              <th scope="row">Current Volume:</th>
              <td colspan="2">{{ this.player.volume().toFixed(3) }}</td>
            </tr>
          </tbody>
        </table>

        <b-row>
          <b-col md="1">
            <b-form-checkbox v-model="stretch" name="check-button" switch></b-form-checkbox>
          </b-col>
          <b-col>
            <span class="font-weight-bold">Stretch Video</span>
          </b-col>
        </b-row>
      </b-modal>
    </div>

    <!-- motd display -->
    <div v-if="!meta.isLive && motd" class="h-100">
      <b-container class="h-100">
        <b-row class="h-100 justify-content-center align-items-center text-center font-italic">
          <b-row>
            <b-col md="12">
              <h3>{{ motd.text }}</h3>
            </b-col>
          </b-row>
        </b-row>
      </b-container>
      <div class="footer text-center text-muted">You can add jokes in discord with /joke add THE_JOKE</div>
    </div>

    <!-- video -->
    <div id="wrapper" v-show="meta.isLive">
      <video id="video" class="video-js" preload="auto" controls></video>
    </div>
  </div>
</template>

<style>
.fill-video {
  object-fit: fill;
}

.settings-modal {
  background-color: rgba(0, 0, 0, 0.7);
  border: unset;
}

.settings-table td {
  text-align: right !important;
}

.vjs-control-amplifier {
  font-size: 1.4em !important;
}

.vjs-control-viewers {
  font-size: 1.3em !important;
}

.video-js {
  font-size: 15px !important;
}

.vjs-control-bar {
  background-color: rgba(0, 0, 0, 0.5) !important;
}

.video-js.vjs-playing .vjs-tech {
  pointer-events: none;
}

.video-js .vjs-play-control {
  display: none;
}

.video-js .vjs-progress-control {
  opacity: 0%;
}

.video-js .vjs-live-control {
  opacity: 0%;
}

.video-js .vjs-remaining-time {
  display: none;
}

body,
html {
  height: 100%;
}
</style>

<style lang="scss" scoped>
@import "@fortawesome/fontawesome-free/css/all.css";
@import "video.js/dist/video-js.css";

body,
html {
  overflow: hidden;
}

.footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
}

.black-bg {
  background-color: black;
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
import ViewerButton from "./lib/ViewerButton";
import AmplifierButton from "./lib/AmplierButton";
import Syncer from "./lib/Syncer";
import axios from "axios";

export default {
  data() {
    return {
      noInteract: false,
      channel: "mtv",
      meta: {},
      viewerButton: null,
      ws: null,
      player: null,
      live: false,
      motd: null,
      syncer: null,
      stretch: false,
      syncerSettings: {
        intensity: 30,
        enabled: false,
      },
    };
  },
  watch: {
    stretch(stretch) {
      localStorage.setItem("stretch-video", stretch);
      const el = this.player.el().children[0];
      stretch ? el.classList.add("fill-video") : el.classList.remove("fill-video");
    },
    syncerSettings: {
      handler(settings, old) {
        localStorage.setItem("syncer-settings-2", JSON.stringify(settings));
        this.syncer.intensity = settings.intensity;
        settings.enabled ? this.syncer.enable() : this.syncer.disable();
      },
      deep: true,
    },
    live(live, old) {
      if (!live) this.getMotd();
    },
    meta: {
      handler(meta, oldMeta) {
        this.viewerButton.updateViewers(meta.viewers);
        this.live = meta.islive;
      },
      deep: true,
    },
  },
  methods: {
    getMotd() {
      axios.get("/api/jokes/motd").then(res => {
        this.motd = res.data;
      });
    },
    play(src) {
      if (!src) {
        this.player.src({
          type: "video/x-flv",
          src: `${process.env.NMS_URL}live/${this.channel}.flv`,
        });
      } else {
        this.player.src(src);
      }

      this.player.play().catch(e => {
        this.noInteract = true;
        toastr.info("Click the video to unmute!");
        videojs.log("Attempting to mute and play due to interact error");
        this.player.muted(true);
        this.player.play();
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
      if (behind > 2 && behind !== Infinity) {
        this.player.currentTime(liveTime - 3);
      }
    },
  },
  mounted() {
    //Websocket for events
    this.ws = new ReconnectingWebSocket(process.env.WSS_URL + this.channel);
    this.ws.onmessage = this.onMessage;

    this.$on("streamInfo", data => {
      if (this.channel === data.channel) {
        this.meta = data.meta;
      }
    });

    // On streamStart play stream
    this.$on("streamStart", data => {
      if (this.channel === data.channel) {
        toastr.success("Stream is starting!");
        this.play();
      }
    });

    //on streamEnd stop stream
    this.$on("streamEnd", data => {
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

    // Add ViewerButton and Amplifier to controlbar
    this.viewerButton = this.player.controlBar.addChild("ViewerCount", { click: this.seekToLive }, 15);
    this.player.controlBar.addChild("Amplifier", {}, 2);

    // Remember volume
    this.player.on("volumechange", () => {
      if (!this.player.muted()) {
        localStorage.setItem("player-volume", this.player.volume());
      }
    });

    // On play seek to live
    this.player.on("play", () => {
      this.seekToLive();
      this.player.volume(localStorage.getItem("player-volume") ?? 1);
    });

    // Fullscreen on double click
    this.player.on("dblclick", event => {
      if (event.target.nodeName === "DIV") {
        this.player.isFullscreen() ? this.player.exitFullscreen() : this.player.requestFullscreen();
      }
    });

    // If player is muted due to non interaction error unmute on click
    this.player.on("click", () => {
      if (this.noInteract) {
        this.noInteract = false;
        this.player.muted(false);
      }
    });

    // Play when ready
    this.player.on("ready", () => {
      if (this.ws.readyState === 0) {
        this.ws.onopen = () => this.play();
      } else {
        this.play();
      }
    });

    // Attach Syncers
    this.syncer = new Syncer(this.player);
    this.syncerSettings = JSON.parse(localStorage.getItem("syncer-settings-2") ?? JSON.stringify(this.syncerSettings));

    // Load default video stretch
    this.stretch = localStorage.getItem("stretch-video") === "true";

    document.addEventListener("keyup", event => {
      if (event.keyCode === 191) {
        this.$refs["settings-modal"].toggle();
      }
    });
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  },
};
</script>
