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
        <canvas id="previewCanvas" :width="tape_length_mm*px_per_mm" :height="tape_width_mm*px_per_mm" ref="canvasElement" v-on:click="onCanvasClicked"></canvas>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import {PropType} from "vue";
import {DesignInterface} from "@/design";
import RulerComponent from "@/components/preview/RulerComponent.vue";

export interface PreviewElementClickedEvent {
  element_id: number | null,
  ctrlPressed: boolean,
  shiftPressed: boolean
}

export default {
  name: "Preview",
  components: {RulerComponent: RulerComponent},
  props: {
    design: {type: Object as PropType<DesignInterface>, required: true},
    selected_element_ids: {type: Set as PropType<Set<number>>, required: true},
    px_per_mm: {type: Number, required: true},
    tape_width_mm: {type: Number, required: true},
    tape_length_mm: {type: Number, required: true},
  },
  emits: {
    elementClicked(payload: PreviewElementClickedEvent): boolean {
      return true;
    },
  },
  watch: {
    design: {
      handler() {
        this.renderCanvas();
      },
      deep: true,
    },
    selected_element_ids: {
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
      //todo
      let fgColor = "#000000";
      let bgColor = "#ffffff";

      let canvas = this.$refs.canvasElement as HTMLCanvasElement;
      let ctx = canvas.getContext("2d")!;
      ctx.fillStyle = fgColor;
      ctx.strokeStyle = fgColor;
      this.design.elements().forEach(e => {
        ctx.save();
        e.update({ctx: ctx, px_per_mm: this.px_per_mm});
        ctx.restore();
      });

      ctx.save();
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      this.design.elements().forEach(e => {
        ctx.save();
        e.render({ctx: ctx, px_per_mm: this.px_per_mm, fg_color: fgColor, bg_color: bgColor});
        ctx.restore();
      });
      ctx.save();
      this.selected_element_ids.forEach(id => {
        const element = this.design.get_element(id);
        const bbox = element.bbox();
        ctx.strokeStyle = "#0000ff";
        ctx.strokeRect(bbox.x1() * this.px_per_mm, bbox.y1() * this.px_per_mm, bbox.width() * this.px_per_mm, bbox.height() * this.px_per_mm);
      });
      ctx.restore();
    },
    onCanvasClicked(event: MouseEvent) {
      let elementEvent: PreviewElementClickedEvent = {
        element_id: null,
        ctrlPressed: event.ctrlKey,
        shiftPressed: event.shiftKey,
      };
      let click_x_mm = event.offsetX / this.px_per_mm;
      let click_y_mm = event.offsetY / this.px_per_mm;
      for (let i = this.design.elements().length - 1; i >= 0; i--) {
        const element = this.design.elements()[i];
        if (element.bbox().containsPoint(click_x_mm, click_y_mm)) {
          elementEvent.element_id = element.id();
          break;
        }
      }
      this.$emit("elementClicked", elementEvent);
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