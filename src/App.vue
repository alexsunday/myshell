<template>
  <div id="shell">
    <app-layout />
  </div>
</template>

<script lang='ts'>
import {Component, Vue, Prop} from 'vue-property-decorator';
import AppLayout from '@/layout/index.vue';

@Component({
  components: {
    'app-layout': AppLayout,
  }
})
export default class App extends Vue {
}
</script>

<style lang="scss" scoped>
#shell {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>

<style>
html {
  height: 100%;
}
body {
  height: 100%;
  margin: 0;
  pad: 0;
}
</style>