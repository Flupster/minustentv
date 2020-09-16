<template>
  <div>
    <b-navbar type="dark">
      <b-navbar-brand href="/streamer">MinustenTV</b-navbar-brand>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item href="/streamer">Streamer</b-nav-item>
          <b-nav-item href="/history" active>History</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <b-container fluid class="mt-2">
      <b-table hover small :items="items" :fields="fields" :busy="isBusy">
        <template v-slot:table-busy>
          <div class="text-center my-4">
            <b-spinner class="align-middle"></b-spinner>
            <strong>Loading...</strong>
          </div>
        </template>
      </b-table>
    </b-container>
  </div>
</template>

<style>
.table.b-table > thead > tr > [aria-sort="ascending"],
.table.b-table > tfoot > tr > [aria-sort="ascending"] {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='101' height='101' view-box='0 0 101 101' preserveAspectRatio='none'%3e%3cpath fill='white' d='M51 1l25 23 24 22H1l25-22z'/%3e%3cpath fill='white' opacity='.3' d='M51 101l25-23 24-22H1l25 22z'/%3e%3c/svg%3e");
}

.table.b-table > thead > tr > [aria-sort="descending"],
.table.b-table > tfoot > tr > [aria-sort="descending"] {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='101' height='101' view-box='0 0 101 101' preserveAspectRatio='none'%3e%3cpath fill='white' opacity='.3' d='M51 1l25 23 24 22H1l25-22z'/%3e%3cpath fill='white' d='M51 101l25-23 24-22H1l25 22z'/%3e%3c/svg%3e");
}

.table.b-table > thead > tr > [aria-sort="none"],
.table.b-table > tfoot > tr > [aria-sort="none"] {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='101' height='101' view-box='0 0 101 101' preserveAspectRatio='none'%3e%3cpath fill='white' opacity='.3' d='M51 1l25 23 24 22H1l25-22zM51 101l25-23 24-22H1l25 22z'/%3e%3c/svg%3e");
}
</style>

<script>
import axios from "axios";
import toastr from "toastr";

export default {
  data() {
    return {
      isBusy: true,
      fields: [
        { key: "user", label: "User", sortable: true },
        { key: "date", label: "Date", sortable: true },
        { key: "source", label: "Source", sortable: true },
      ],
      items: [],
    };
  },
  methods: {
    onData(res) {
      this.items = res.data;
      this.isBusy = false;
    },
    onError() {
      toastr.error("Could not fetch history");
      this.$router.push({ name: "Player" });
    },
  },
  watch: {},
  mounted() {
    axios.get("/api/history/stream").then(this.onData).catch(this.onError);
  },
  beforeMount() {
    if (!this.$store.state.user) {
      this.$router.push({ name: "Login" });
    } else if (!this.$store.state.user.verified) {
      this.$router.push({ name: "Player" });
    }
  },
};
</script>
