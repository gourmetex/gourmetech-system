<template>
  <div id="app">
    <router-view path="$router.key" />
  </div>
</template>

<script>
import './style/global.css';
import 'animate.css';
import '@lottiefiles/lottie-player';
import { globalMethods } from '@/js/globalMethods';

export default {
  name: 'App',
  mixins: [globalMethods],
  mounted: function () {
    this.returnMenuOptions();
  }
}
</script>
<style scoped>
#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>
