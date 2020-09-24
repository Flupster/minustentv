<template>
  <div class="h-100 black-bg">
    <div>
      <b-modal v-if="player" ref="settings-modal" title="Settings / Info" hide-footer centered>
        <b-row>
          <b-col md="1">
            <b-form-checkbox v-model="syncSettings.enabled" name="check-button" switch></b-form-checkbox>
          </b-col>
          <b-col>
            <b-form-input
              style="direction: rtl"
              v-model="syncSettings.intensity"
              type="range"
              min="1"
              max="100"
              step="0.5"
            ></b-form-input>
          </b-col>
        </b-row>

        <table class="table table-sm table-borderless">
          <tbody>
            <tr>
              <th scope="row">Sync Intensity:</th>
              <td>{{ Math.abs(this.syncSettings.intensity - 100).toFixed(1) }}</td>
            </tr>
            <tr>
              <th scope="row">Sync Divider:</th>
              <td>{{ this.syncSettings.intensity }}</td>
            </tr>
            <tr>
              <th scope="row">At Live Edge:</th>
              <td>{{ this.player.liveTracker.atLiveEdge() }}</td>
            </tr>
            <tr>
              <th scope="row">Current Time:</th>
              <td>{{ this.player.currentTime().toFixed(3) }}</td>
            </tr>
            <tr>
              <th scope="row">Behind Live:</th>
              <td>{{ (this.player.liveTracker.liveCurrentTime() - this.player.currentTime()).toFixed(3) }}</td>
            </tr>
            <tr>
              <th scope="row">Live Time:</th>
              <td>{{ this.player.liveTracker.liveCurrentTime().toFixed(3) }}</td>
            </tr>
            <tr>
              <th scope="row">Last Chunk:</th>
              <td>{{ this.player.liveTracker.pastSeekEnd().toFixed(3) }}</td>
            </tr>
            <tr>
              <th scope="row">Seekable End:</th>
              <td>{{ this.player.liveTracker.seekableEnd().toFixed(3) }}</td>
            </tr>
            <tr>
              <th scope="row">Playback Rate:</th>
              <td>{{ this.player.playbackRate().toFixed(3) }}</td>
            </tr>
            <tr>
              <th scope="row">Current Volume:</th>
              <td>{{ this.player.volume().toFixed(3) }}</td>
            </tr>
          </tbody>
        </table>
      </b-modal>
    </div>
    <div v-show="meta.isLive" id="wrapper">
      <video id="video" class="video-js" preload="auto" controls></video>
    </div>
    <div v-if="!meta.isLive && fact" class="h-100">
      <b-container class="h-100">
        <b-row class="h-100 justify-content-center align-items-center text-center font-italic">
          <b-row>
            <b-col md="12 mb-4">
              <h1>{{ fact.on }}</h1>
            </b-col>
            <b-col md="12 mt-4">
              <h3>{{ fact.description }}</h3>
            </b-col>
          </b-row>
        </b-row>
      </b-container>
      <div class="footer text-center text-muted">
        <span>Nothing is being streamed yet so you get a random event that happened on this day :)</span>
      </div>
    </div>
  </div>
</template>

<style>
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
import axios from "axios";

export default {
  data() {
    return {
      noInteract: false,
      channel: "mtv",
      meta: {},
      viewerButton: new ViewerButton(),
      ws: null,
      player: null,
      live: false,
      fact: null,
      syncSettings: { intensity: 30, enabled: true },
    };
  },
  watch: {
    syncSettings: {
      handler(settings, old) {
        localStorage.setItem("sync-settings", JSON.stringify(this.syncSettings));
        if (!settings.enabled) {
          this.player.playbackRate(1);
        }
      },
      deep: true,
    },
    live(live, old) {
      if (!live) this.getFact();
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
    sync() {
      if (!this.syncSettings.enabled) return;

      const behind = this.player.liveTracker.liveCurrentTime() - this.player.currentTime();
      if (behind === Infinity) return;

      this.player.playbackRate(1 + (behind - 3) / this.syncSettings.intensity);
    },
    getFact() {
      axios.get("/api/facts").then(res => {
        this.fact = res.data;
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
    this.player.controlBar.addChild(this.viewerButton, {}, 15);
    this.player.controlBar.addChild(new AmplifierButton(this.player), {}, 2);

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

    // On click of viewerButton seek to live edge
    this.viewerButton.on("click", this.seekToLive);

    // If player is muted due to non interaction error unmute on click
    this.player.on("click", () => {
      if (this.noInteract) {
        this.noInteract = false;
        this.player.muted(false);
      }
    });

    // Play when ready
    this.player.on("ready", () => this.play());

    // Attempt to sync video to 3s behind live
    setInterval(this.sync, 1000);

    //Load previous intensity
    this.syncSettings = JSON.parse(
      localStorage.getItem("sync-settings") ?? JSON.stringify(this.syncSettings)
    );

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
