<template>
  <div class="container-fluid">
    <div class="text-center">
      <img src="../assets/notfound.gif" />
    </div>
    <h1 class="text-center">
      <a href="#" @click="$router.go(-1)">GO BACK</a>
    </h1>
  </div>
</template>

<style scoped>
@import "bootswatch/dist/slate/bootstrap.min.css";
img {
  width: auto;
  height: 100%;
  max-height: 90vh;
  height: 90vh;
}
</style>