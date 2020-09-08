<template>
  <div class="container">
    <form v-if="logincheck" class="form-signin" @submit.prevent="login">
      <input
        type="email"
        name="email"
        autocomplete="email"
        class="form-control"
        placeholder="Email"
        required
        autofocus
      />
      <input
        type="password"
        name="password"
        autocomplete="current-password"
        class="form-control"
        placeholder="Password"
        required
      />
      <button class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
      <div class="mt-5 mb-3 text-muted text-center">
        <router-link to="/register">Register</router-link>
      </div>
    </form>
  </div>
</template>

<style scoped>
@import "bootswatch/dist/slate/bootstrap.min.css";
@import "toastr";

.form-signin {
  max-width: 40vw;
  padding-top: 40vh;
  margin: 0 auto;
}

.form-signin .form-control {
  position: relative;
  box-sizing: border-box;
  border-radius: 5px;
  height: auto;
  padding: 10px;
  font-size: 20px;
}

.form-signin input[type="email"] {
  margin-bottom: 5px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.form-signin input[type="password"] {
  margin-bottom: 5px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>

<script>
import axios from "axios";
import toastr from "toastr";

export default {
  data() {
    return {
      logincheck: false,
    };
  },
  mounted() {
    axios
      .get("/api/user")
      .then((r) => {
        this.$router.push("streamer");
      })
      .catch((e) => {
        this.logincheck = true;
      });
  },
  methods: {
    login(submit) {
      axios
        .post("/api/auth/login", {
          email: submit.target.elements.email.value,
          password: submit.target.elements.password.value,
        })
        .then((r) => {
          toastr.success(r.data.message);
          this.$router.push("streamer");
        })
        .catch((e) => toastr.error(e.response.data.error));
    },
  },
};
</script>