import Vue from "vue";
import Vuex from "vuex";
import pathify, { make } from "vuex-pathify";
import VuexPersistence from "vuex-persist";

Vue.use(Vuex);

const state = {
  volume: 0.5,
  stretchVideo: false,
  syncIntensity: 30,
  syncEnabled: true,
};

const PlayerStore = {
  namespaced: true,
  state,
  mutations: make.mutations(state),
};

// store
const store = new Vuex.Store({
  modules: {
    player: PlayerStore,
  },

  plugins: [pathify.plugin, new VuexPersistence().plugin],
});

export default store;
window.store = store;
