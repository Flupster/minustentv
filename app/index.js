import Vue from "vue";
import Vuex from "vuex";
import VueRouter from "vue-router";

Vue.use(Vuex);
Vue.use(VueRouter);

import App from "./App.vue";
import Streamer from "./Streamer.vue";
import Player from "./Player.vue";
import Login from "./Login.vue";
import Register from "./Register.vue";
import NotFound from "./NotFound.vue";

import axios from "axios";

const store = new Vuex.Store({
  state: {
    user: null,
  },
  mutations: {
    loggedIn(state) {
      axios
        .get("/api/user")
        .then(r => (state.user = r.data))
        .catch(console.error);
    },
  },
});

const router = new VueRouter({
  mode: "history",
  base: "/",
  routes: [
    { name: "Player", path: "/", component: Player },
    { name: "Login", path: "/login", component: Login },
    { name: "Register", path: "/register", component: Register },
    { name: "Streamer", path: "/streamer", component: Streamer },
    { name: "NotFound", path: "*", component: NotFound },
  ],
});

axios
  .get("/api/user")
  .then(r => (store.state.user = r.data))
  .catch(() => {})
  .finally(() => {
    new Vue({
      router,
      store,
      render: h => h(App),
    }).$mount("#app");
  });
