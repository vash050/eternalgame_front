<template>
  <div>
    <h1>Babylon</h1>
    <canvas></canvas>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {NewGame} from "@/game/newGame";

export default defineComponent({
  name: 'BabylonExamples',
  mounted() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const canvas = document.querySelector('canvas')!;
    new NewGame(canvas);

  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
canvas {
  width: 100%;
  height:100%;
}
</style>
