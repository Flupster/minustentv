import Vue from "vue";
import Vuex from "vuex";
import VueRouter from "vue-router";
import BootstrapVue from "bootstrap-vue";

Vue.use(Vuex);
Vue.use(VueRouter);
Vue.use(BootstrapVue);

import App from "./App.vue";
import Streamer from "./Streamer.vue";
import Login from "./Login.vue";
import Player from "./Player.vue";
import StreamerCards from "./StreamerCards.vue";
import History from "./History.vue";
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
    { name: "streamer-cards", path: "/streamer-cards", component: StreamerCards },
    { name: "Streamer", path: "/streamer", component: Streamer },
    { name: "History", path: "/history", component: History },
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
