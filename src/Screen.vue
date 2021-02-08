<template>
  <div>
    <b-button @click="onClick">Start</b-button>
    <video autoplay muted style="width: 720px"></video>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      ws: null,
    };
  },
  methods: {
    onClick() {
      navigator.mediaDevices
        .getDisplayMedia({
          video: true,
          audio: true,
        })
        .then(stream => {
          stream.getVideoTracks()[0].addEventListener("ended", () => {
            errorMsg("The user has ended sharing the screen");
            startButton.disabled = false;
          });
          document.querySelector("video").srcObject = stream;
          const recorder = new MediaRecorder(stream);
          console.log(recorder);
          recorder.start(0);
          recorder.ondataavailable = e => this.ws.send(e.data);
        });
    },
  },
  created() {
    this.ws = new WebSocket("wss://minusten.tv/api/streamer/blob");
  },
};
</script>

<style>
</style>