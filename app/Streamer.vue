<template>
  <div v-if="loaded" @paste="onPaste" class="container">
    <div v-bind:class="{ 'd-none': !nav }" id="sidebar" class="sidebar">
      <a href="javascript:void(0)" class="closebtn" @click="toggleNav">x</a>
      <div class="container-fluid">
        <div class="form-group row">
          <label
            for="startTime"
            class="col-sm-4 col-form-label font-weight-bold text-center"
          >Start Time</label>
          <div class="col-sm-6">
            <input type="text" class="form-control" id="startTime" v-model="startTime" />
          </div>
        </div>

        <div class="form-group row">
          <label
            for="subtitles"
            class="col-sm-4 col-form-label font-weight-bold text-center"
          >Subtitles</label>
          <div class="col-sm-6">
            <select id="inputState" class="form-control">
              <option selected>Not implemented yet</option>
              <option>ur gay pwnd</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <button
      class="btn btn-dark btn"
      style="position: absolute; left: 0; top: 0;"
      v-bind:class="{ 'd-none': nav }"
      @click="toggleNav"
    >Options</button>
    <button
      class="btn btn-dark btn"
      style="position: absolute; right: 0; top: 0;"
      @click="kill()"
    >Kill</button>
    <div class="row">
      <div class="col-6">
        <input class="form-control" v-model="search" placeholder="Search Remote Files" autofocus />
      </div>
      <div class="col-6">
        <div>
          <form @submit.prevent="uploadFile()">
            <input
              type="file"
              class="custom-file-input"
              id="file"
              ref="file"
              @change="streamUpload"
            />
            <label class="custom-file-label" for="file">Stream Local File</label>
          </form>
        </div>
      </div>
    </div>
    <hr />
    <div class="row">
      <div class="col-12">
        <div class="list-group" v-for="result in results">
          <a
            href="#"
            class="list-group-item list-group-item-action"
            @click="streamFile(result)"
          >{{ result.split('/').slice(-1).pop() }}</a>
        </div>
      </div>
    </div>

    <div v-if="progress" class="progress-footer fixed-bottom">
      <div class="row">
        <div class="col-6">
          <div class="row font-weight-bold">
            <div class="col-6 text-center">
              Time
              <br />
              {{ progress.timemark.slice(0,-3) }}
              <span
                v-if="progress.runtime"
              >/ {{ progress.runtime }}</span>
            </div>
            <div class="col text-center">
              Bitrate
              <br />
              {{ progress.currentKbps }} kbps
            </div>
            <div v-if="progress.percent" class="col text-center">
              Progress
              <br />
              {{ progress.percent.toFixed(2) }}%
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="progress" style="height: 100%">
            <div
              v-bind:style="{ width: progress.percent + '%' }"
              class="progress-bar progress-bar-striped progress-bar-animated"
              role="progressbar"
              v-bind:aria-valuenow="progress.percent"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "bootswatch/dist/slate/bootstrap.min.css";
@import "toastr";

.sidebar {
  height: 100%;
  width: 30vw;
  position: fixed;
  z-index: 500;
  top: 0;
  left: 0;
  background-color: #111111ba;
  overflow-x: hidden;
  padding-top: 60px;
}

.sidebar .closebtn {
  position: absolute;
  top: 0;
  right: 25px;
  font-size: 36px;
  margin-left: 50px;
}

.progress-footer {
  background-color: #0000001f;
}
</style>

<script>
import axios from "axios";
import toastr from "toastr";

export default {
  data() {
    return {
      search: "",
      results: [],
      ws: null,
      progress: null,
      startTime: "00:00:00",
      nav: false,
      loaded: false,
    };
  },
  methods: {
    formatProgress(progress) {
      const time = progress.timemark;
      const ms = parseInt(time.substr(-2)) / 100;
      const times = time
        .slice(0, -3)
        .split(":")
        .map((n) => parseInt(n));
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

        default:
          console.warn("Unknown event", json);
          break;
      }
    },
    toggleNav() {
      this.nav = !this.nav;
    },
    onPaste(clipboard) {
      const text = clipboard.clipboardData.getData("text");
      if (text && text.startsWith("http")) {
        toastr.info(text, "Trying to play");
        axios
          .post("/api/streamer/stream/url", { url: text })
          .catch((e) =>
            toastr.error(e.response.data?.error ?? "Unknown Error")
          );
      }
    },
    kill() {
      axios
        .delete("/api/streamer/mtv")
        .then((r) => {
          this.progress = null;
          toastr.success(r.data.success);
        })
        .catch((e) => toastr.error(e.response.data?.error ?? "Unknown Error"));
    },
    streamUpload() {
      const formData = new FormData();
      formData.append("image", this.$refs.file.files[0]);
      axios
        .post("/api/streamer/stream/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((r) => toastr.success(r.data.message))
        .catch((e) =>
          toastr.error(e.response.data?.error ?? "That didn't work")
        );

      toastr.warning(
        "If you close this browser tab the stream will end!",
        "Uploading File..."
      );
    },
    streamFile(file) {
      this.search = "";
      this.results = [];
      axios
        .post("/api/streamer/stream/file", { file, start: this.startTime })
        .then((r) => {
          toastr.success(`PID: ${r.data.pid}`, "Stream started");
          this.startTime = "00:00:00";
        })
        .catch((e) => toastr.error(e.response.data.error, "Stream error"));
    },
  },
  watch: {
    search(search) {
      if (search.length > 3) {
        axios
          .post("/api/streamer/search", { search })
          .then((r) => (this.results = r.data))
          .catch((e) => toastr.error(e.response.data.error, "Search error"));
      }
    },
  },
  mounted() {
    axios
      .get("/api/user")
      .then((r) => {
        if (!r.data.verified) {
          this.$router.push("unverified");
        } else {
          this.loaded = true;
        }
      })
      .catch((e) => {
        toastr.error("You need to be logged in");
        this.$router.push("login");
      });

    this.ws = new WebSocket(process.env.WSS_URL + "api/streamer");
    this.ws.onmessage = this.onMessage;
  },
};
</script>