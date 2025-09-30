<template>
  <canvas id="previewCanvas" width="100%" :height="tape_width_mm*px_per_mm" ref="canvasElement"></canvas>
</template>

<script lang="ts">

import {PropType} from "vue";

export default {
  name: "Preview",
  props: {
    design: {type: Object as PropType<DesignInterface>, required: true},
    px_per_mm: {type: Number, required: true},
    tape_width_mm: {type: Number, required: true},
  },
  watch: {
    design: {
      handler() {
        this.renderCanvas();
      },
      deep: true,
    }
  },
  mounted(): any {
    this.renderCanvas();
  },
  methods: {
    renderCanvas() {
      let canvas = this.$refs.canvasElement as HTMLCanvasElement;
      let ctx = canvas.getContext("2d")!;

      this.design.elements().forEach(e => {
        e.update({ctx: ctx, px_per_mm: this.px_per_mm});
      });

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      this.design.elements().forEach(e => {
        e.render({ctx: ctx, px_per_mm: this.px_per_mm, fg_color: "#000000", bg_color: "#ffffff"});
      });
    }
  }
}
</script>

<style scoped>

</style>