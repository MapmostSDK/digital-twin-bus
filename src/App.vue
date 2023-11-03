<template>
  <div id="app">
    <Map></Map>
  </div>
</template>

<script>
import Map from "@/components/Map.vue";
export default {
  name: "App",
  components: {
    Map,
  },
};
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
}
#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>
