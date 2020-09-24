<template>
  <b-container fluid>
    <b-row class="text-center">
      <b-col>
        <img src="./assets/404.gif" />
      </b-col>
    </b-row>
    <b-row class="mt-3 text-center">
      <b-col>
        <h3>
          <b-link @click="$router.go(-1)">GO BACK</b-link>
        </h3>
      </b-col>
    </b-row>
  </b-container>
</template>

<style scoped>
img {
  width: auto;
  height: 100%;
  max-height: 90vh;
  height: 90vh;
}
</style>
