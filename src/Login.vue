<template></template>

<script>
import axios from "axios";
import toastr from "toastr";

export default {
  created() {
    if (this.$store.state.user) {
      this.$router.push({ name: "Streamer" });
    } else {
      window.location.href = process.env.BASE_URL + "auth/login";
    }
  },
};
</script>
