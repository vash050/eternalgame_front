<template>
  <div>
    <h1>Babylon</h1>
    <canvas></canvas>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {FirstControll} from "@/BabylonExamples/FirstControll";

export default defineComponent({
  name: 'BabylonExamples',
  mounted() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const canvas = document.querySelector('canvas')!;
    new FirstControll(canvas);

  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
canvas {
  width: 70%;
  height: 70%;
}
</style>
