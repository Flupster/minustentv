<template>
  <b-container>
    <b-form class="form-signin mx-auto" @submit="login" style="width: 400px;">
      <b-row class="mb-4 text-center">
        <b-col class="h1">Login</b-col>
      </b-row>

      <b-row class="my-1">
        <b-input v-model="form.email" type="email" placeholder="Email" required autofocus></b-input>
      </b-row>

      <b-row class="my-1">
        <b-input v-model="form.password" type="password" placeholder="Password" required></b-input>
      </b-row>

      <b-row class="my-3">
        <b-button type="submit" variant="info" block>Let me in!</b-button>
      </b-row>
    </b-form>
  </b-container>
</template>

<style scoped>
.form-signin {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
<script>
import axios from "axios";
import toastr from "toastr";

export default {
  data() {
    return {
      form: {
        email: "",
        password: "",
      },
    };
  },
  methods: {
    login(evt) {
      evt.preventDefault();
      axios
        .post("/api/auth/login", this.form)
        .then(this.processLogin)
        .catch(e => toastr.error(e.response.data.error));
    },
    processLogin(req) {
      toastr.success(req.data.message);
      this.$store.commit("loggedIn");
      this.$store.watch(
        state => state.user,
        user => this.$router.push({ name: "Streamer" })
      );
    },
  },
  created() {
    if (this.$store.state.user) {
      this.$router.push({ name: "Streamer" });
    }
  },
};
</script>
