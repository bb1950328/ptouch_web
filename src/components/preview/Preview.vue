<template>
  <div class="preview-wrapper">
    <div class="preview-fixed-left">
      <div class="preview-ruler-v">
        <RulerComponent :length_px="tape_width_mm*px_per_mm" direction="left" :pixel-per-mm="px_per_mm"/>
      </div>
    </div>
    <div class="preview-scrolling">
      <div class="preview-ruler-h">
        <RulerComponent :length_px="tape_length_mm*px_per_mm" direction="top" :pixel-per-mm="px_per_mm"/>
      </div>
      <div class="preview-canvas">
        <canvas id="previewCanvas" :width="tape_length_mm*px_per_mm" :height="tape_width_mm*px_per_mm" ref="canvasElement"></canvas>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import {PropType} from "vue";
import {DesignInterface} from "@/design";
import RulerComponent from "@/components/preview/RulerComponent.vue";

export default {
  name: "Preview",
  components: {RulerComponent: RulerComponent},
  props: {
    design: {type: Object as PropType<DesignInterface>, required: true},
    px_per_mm: {type: Number, required: true},
    tape_width_mm: {type: Number, required: true},
    tape_length_mm: {type: Number, required: true},
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
.preview-wrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
}

.preview-fixed-left {
  padding-right: 10px;
}

.preview-ruler-v {
  margin-top: 40px;
  align-self: end;
}

.preview-ruler-h {
  height: 40px;
}

.preview-scrolling {
  overflow-x: scroll;
}
</style>