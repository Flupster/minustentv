<template>
  <div>
    <!-- NavBar -->
    <b-navbar toggleable="lg" type="dark" variant="dark">
      <b-navbar-brand to="/">MinustenTV</b-navbar-brand>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item to="/streamer" active>Streamer</b-nav-item>
          <b-nav-item to="/history">History</b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto nav-search">
          <!-- Inputs -->
          <b-nav-form>
            <b-form-checkbox v-model="niceNames" switch>Nice Names</b-form-checkbox>
          </b-nav-form>
          <b-col>
            <b-form-input v-model="search" placeholder="Search Remote Files" autofocus></b-form-input>
          </b-col>
          <b-col>
            <b-form-file v-model="upload" placeholder="Stream Your File"></b-form-file>
          </b-col>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <!-- Search Results -->
    <b-container class="mt-4" @paste="onPaste">
      <b-row>
        <b-col md="12">
          <b-overlay :show="searchLoading" variant="dark" rounded="sm">
            <b-list-group>
              <b-list-group-item
                v-for="result in searchResults"
                v-b-modal.stream-modal
                @click="stream.file = result.file"
              >{{ result.name }}</b-list-group-item>
            </b-list-group>
          </b-overlay>
        </b-col>
      </b-row>
    </b-container>

    <!-- Footer -->
    <div v-if="progress" class="progress-footer fixed-bottom">
      <b-row>
        <b-col md="6">
          <b-row class="font-weight-bold">
            <b-col class="text-center">
              Time
              <br />
              {{ progress.timemark.slice(0, -3) }} / {{ progress.runtime || "?" }}
            </b-col>

            <b-col class="text-center">
              Bitrate
              <br />
              {{ progress.currentKbps }} kbps
            </b-col>
          </b-row>
        </b-col>
        <b-col v-if="progress.percent" md="6">
          <b-progress max="100" height="100%">
            <b-progress-bar :value="progress.percent" variant="info"></b-progress-bar>
            <span>{{ progress.percent.toFixed(2) }} %</span>
          </b-progress>
        </b-col>

        <b-button @click="kill" class="float-right kill-btn">
          <i class="fas fa-stop"></i>
        </b-button>
      </b-row>
    </div>

    <!-- Stream Modal -->
    <b-modal
      id="stream-modal"
      centered
      size="lg"
      ok-title="Stream"
      ok-variant="success"
      cancel-variant="danger"
      @ok="streamFile"
      @show="getMediaInfo"
    >
      <b-form-group label-cols-sm="2" label-cols-lg="2" label="File Path">
        <b-form-input v-model="stream.file" disabled></b-form-input>
      </b-form-group>
      <b-form-group label-cols-sm="2" label-cols-lg="2" label="Start Time">
        <b-form-input v-model="stream.start"></b-form-input>
      </b-form-group>
      <b-form-group label-cols-sm="2" label-cols-lg="2" label="Resolution">
        <b-form-select v-model="stream.resolution" :options="tracks.resolution"></b-form-select>
      </b-form-group>
      <b-form-group label-cols-sm="2" label-cols-lg="2" label="Video">
        <b-form-select v-model="stream.video" :options="tracks.video"></b-form-select>
      </b-form-group>
      <b-form-group label-cols-sm="2" label-cols-lg="2" label="Audio">
        <b-form-select v-model="stream.audio" :options="tracks.audio"></b-form-select>
      </b-form-group>
      <b-form-group label-cols-sm="2" label-cols-lg="2" label="Subtitles">
        <b-form-select v-model="stream.subtitle" :options="tracks.subtitle"></b-form-select>
      </b-form-group>
    </b-modal>
  </div>
</template>

<style>
.kill-btn {
  position: absolute;
  right: 0;
  bottom: 0;
  height: 100%;
}

.search-loading {
  width: 3rem;
  height: 3rem;
}

.nav-search {
  min-width: 50vw;
  position: absolute;
  right: 0;
}

.progress span {
  position: absolute;
  top: 50%;
  font-size: 180%;
  text-align: center;
  width: 100%;
  color: white;
}

.bg-info {
  background-color: #5bc0de80 !important;
}

.progress-footer {
  background-color: #0000001f;
}
</style>

<script>
import axios from "axios";
import toastr from "toastr";
import langs from "langs";
import ReconnectingWebSocket from "reconnecting-websocket";
import path from "path-browserify";
import oleoo from "oleoo";

export default {
  data() {
    return {
      search: "",
      searchLoading: false,
      upload: null,
      tracks: {},
      stream: {},
      results: [],
      ws: null,
      progress: null,
      showModal: false,
      niceNames: true,
    };
  },
  computed: {
    searchResults() {
      return this.results.map(file => {
        if (!this.niceNames) {
          return { file, name: file.split("/").pop() };
        }

        const result = {};
        result.file = file;
        result.path = path.parse(file);
        result.scene = oleoo.parse(result.path.name);

        if (result.scene.score < 2) {
          result.name = result.path.name;
          return result;
        }

        switch (result.scene.type) {
          case "tvshow":
            const season = String(result.scene.season).padStart(2, "0");
            const episode = String(result.scene.episode).padStart(2, "0");
            result.name = `${result.scene.title} S${season}E${episode}`;
            return result;

          case "movie":
            const year = result.scene.year ? ` (${result.scene.year})` : "";
            result.name = `${result.scene.title}${year}`;
            return result;

          default:
            result.name = result.path.name;
            return result;
        }
      });
    },
  },
  methods: {
    getMediaInfo(event) {
      axios
        .get("/api/streamer/mediainfo", { params: { file: this.stream.file } })
        .then(r => {
          this.stream = {
            file: this.stream.file,
            start: "00:00:00",
            video: 0,
            audio: 0,
            subtitle: null,
            resolution: 720,
          };

          this.tracks = {
            video: [],
            audio: [],
            subtitle: [{ value: null, text: "Disabled" }],
            resolution: [
              { value: 480, text: "480p" },
              { value: 720, text: "720p" },
            ],
          };

          const vt = r.data.streams.filter(s => s.codec_type === "video")[0];
          if (vt.height && vt.height > 720) {
            this.tracks.resolution.push({ value: 1080, text: "1080p" });
          }

          r.data.streams.forEach(stream => {
            const language = langs.where("2B", stream.tags?.language);
            const text = stream.tags?.title ?? language?.name ?? "Unknown";

            switch (stream.codec_type) {
              case "video":
                this.tracks.video.push({
                  text,
                  value: this.tracks.video.length,
                });
                break;

              case "audio":
                this.tracks.audio.push({
                  text,
                  value: this.tracks.audio.length,
                });
                break;

              case "subtitle":
                this.tracks.subtitle.push({
                  text,
                  value: this.tracks.subtitle.length - 1,
                });
                break;
            }
          });
        })
        .catch(e => {
          console.error(e);
          toastr.error("Failed to get media info!");
        });
    },
    formatProgress(progress) {
      if (!progress.percent) {
        return (this.progress = progress);
      }

      const time = progress.timemark;
      const ms = parseInt(time.substr(-2)) / 100;
      const times = time
        .slice(0, -3)
        .split(":")
        .map(n => parseInt(n));
      const total = times[0] * 3600 + times[1] * 60 + times[2] + ms;
      const runtime = Math.ceil((100 / progress.percent) * total);
      progress.runtime = new Date(runtime * 1000).toISOString().substr(11, 8);

      this.progress = progress;
    },
    onMessage(message) {
      const json = JSON.parse(message.data);

      switch (json.event) {
        case "progress":
          this.formatProgress(json.data);
          break;

        case "success":
          toastr.success(json.data);
          break;

        case "error":
          this.progress = null;
          toastr.error(json.data);
          break;

        case "start":
          console.log("New stream", json);
          break;

        case "log":
          console.log(json.data);
          break;

        default:
          console.warn("Unknown event", json);
          break;
      }
    },
    onPaste(clipboard) {
      const text = clipboard.clipboardData.getData("text");
      if (text && text.startsWith("http")) {
        toastr.info(text, "Trying to play");
        axios
          .post("/api/streamer/stream/url", { url: text })
          .catch(e => toastr.error(e.response.data?.error ?? "Unknown Error"));
      }
    },
    kill() {
      axios
        .delete("/api/streamer/mtv")
        .then(r => {
          this.progress = null;
          toastr.success(r.data.success);
        })
        .catch(e => toastr.error(e.response.data?.error ?? "Unknown Error"));
    },
    streamFile() {
      this.search = "";
      axios
        .post("/api/streamer/stream/file", this.stream)
        .then(r => {
          toastr.success(`PID: ${r.data.pid}`, "Stream started");
        })
        .catch(e => toastr.error(e.response.data.error, "Stream error"));
    },
  },
  watch: {
    niceNames(value) {
      localStorage.setItem("niceNames", value);
    },
    upload(file) {
      const formData = new FormData();
      formData.append("image", file);
      axios
        .post("/api/streamer/stream/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then(r => toastr.success(r.data.message))
        .catch(e => toastr.error(e.response.data?.error ?? "That didn't work"));

      toastr.warning("If you close this browser tab the stream will end!", "Uploading File...");
    },
    search(search) {
      if (search.length > 3) {
        this.searchLoading = true;
        axios
          .post("/api/streamer/search", { search })
          .then(r => (this.results = r.data))
          .catch(e => toastr.error(e.response.data.error, "Search error"))
          .finally(() => (this.searchLoading = false));
      }
    },
  },
  mounted() {
    this.ws = new ReconnectingWebSocket(process.env.WSS_URL + "api/streamer");
    this.ws.onmessage = this.onMessage;
  },
  beforeMount() {
    if (!this.$store.state.user) {
      toastr.warning("Login or get the Patreon role to visit the streamer!", "Access denied");
      this.$router.push({ name: "Player" });
    }

    this.niceNames = localStorage.getItem("niceNames") ?? true;
  },
};
</script>
