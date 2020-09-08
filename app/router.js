import Vue from "vue";
import VueRouter from "vue-router";

import Streamer from "./Streamer.vue";
import Player from "./Player.vue";
import Login from "./Login.vue";
import Register from "./Register.vue";
import NotFound from "./NotFound.vue";

Vue.use(VueRouter);

const router = new VueRouter({
  mode: "history",
  base: "/",
  routes: [
    { path: "/", component: Player },
    { path: "/login", component: Login },
    { path: "/register", component: Register },
    { path: "/streamer", component: Streamer },
    { path: "*", component: NotFound },
  ],
});

export default router;
