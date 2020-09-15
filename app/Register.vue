<template>
  <b-container>
    <b-form class="form-register mx-auto" @submit="register" style="width: 400px;">
      <b-row class="mb-4 text-center">
        <b-col class="h1">Register</b-col>
      </b-row>

      <b-row class="my-1">
        <b-input v-model="form.name" type="text" placeholder="Username" required autofocus></b-input>
      </b-row>

      <b-row class="my-1">
        <b-input v-model="form.email" type="email" placeholder="Email" required></b-input>
      </b-row>

      <b-row class="my-1">
        <b-input v-model="form.password" type="password" placeholder="Password" required></b-input>
      </b-row>

      <b-row class="my-1">
        <b-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="Confirm Password"
          required
        ></b-input>
      </b-row>

      <b-row class="my-3">
        <b-button type="submit" variant="success" block>Register</b-button>
      </b-row>

      <b-row class="mt-5 mb-3 text-muted text-center">
        <b-col>
          <router-link to="/login">Login</router-link>
        </b-col>
      </b-row>
    </b-form>
  </b-container>
</template>

<style scoped>
.form-register {
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
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
    };
  },
  methods: {
    register(evt) {
      evt.preventDefault();
      axios
        .post("/api/auth/signup", this.form)
        .then(res => {
          toastr.success(res.data.message);
          this.$router.push("streamer");
        })
        .catch(e => toastr.error(e.response.data.error));
    },
  },
  created() {
    if (this.$store.state.user) {
      this.$router.push({ name: "Streamer" });
    }
  },
};
</script>