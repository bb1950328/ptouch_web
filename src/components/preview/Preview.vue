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
        <canvas id="previewCanvas"
                ref="canvasElement"
                @mousedown="onMouseDown"
                @mousemove="onMouseMove"
                @mouseup="onMouseUp"></canvas>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import {PropType} from "vue";
import {DesignElement, DesignInterface, MovableDesignElement} from "@/design";
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
    tape_margin_mm: {type: Number, required: true},
    tape_length_mm: {type: Number, required: true},
  },
  emits: {
    elementClicked(payload: PreviewElementClickedEvent): boolean {
      return true;
    },
    elementsChanged(elements: DesignElement[]): boolean {
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
    },
    px_per_mm() {
      this.renderCanvas();
    },
    tape_width_mm() {
      this.renderCanvas();
    },
    tape_margin_mm() {
      this.renderCanvas();
    },
    tape_length_mm() {
      this.renderCanvas();
    },
  },
  data() {
    return {
      drag: {
        isDragging: false,
        startXMM: 0,
        startYMM: 0,
        dxMM: 0,
        dyMM: 0,
        initialAnchors: new Map<number, [number, number]>(),
        dragCopies: new Map<number, MovableDesignElement>(),
        justDragged: false,
      }
    };
  },
  async mounted() {
    await this.renderCanvas();
  },
  methods: {
    async renderCanvas() {
      let fgColor = "#000000";
      let bgColor = "#ffffff";

      const canvas = this.$refs.canvasElement as HTMLCanvasElement;

      canvas.width = this.tape_length_mm * this.px_per_mm;
      canvas.height = this.tape_width_mm * this.px_per_mm;

      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = fgColor;
      ctx.strokeStyle = fgColor;

      const elementsToRender: DesignElement[] = this.design.elements().map(e => {
        const dragCopy = this.drag.dragCopies?.get(e.id());
        return dragCopy ?? e;
      });

      // Update metrics for all
      const changedElements: DesignElement[] = [];
      for (const e of elementsToRender) {
        ctx.save();
        const changed = await e.update({ctx: ctx, px_per_mm: this.px_per_mm});
        ctx.restore();
        if (changed) {
          changedElements.push(e);
        }
      }

      // Clear background
      ctx.save();
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Draw margins
      ctx.save();
      ctx.strokeStyle = "#f0f";
      ctx.setLineDash([10, 5, 2, 5]);
      ctx.beginPath();
      let margin1_y = this.px_per_mm * this.tape_margin_mm;
      let margin2_y = canvas.height - this.px_per_mm * this.tape_margin_mm;
      ctx.moveTo(0, margin1_y);
      ctx.lineTo(canvas.width, margin1_y);
      ctx.moveTo(0, margin2_y);
      ctx.lineTo(canvas.width, margin2_y);
      ctx.stroke();
      ctx.restore();

      // Render elements in order
      for (const e of elementsToRender) {
        ctx.save();
        await e.render({ctx: ctx, px_per_mm: this.px_per_mm, fg_color: fgColor, bg_color: bgColor});
        ctx.restore();
      }

      // Draw selection rectangles (use dragged copy if exists)
      ctx.save();
      this.selected_element_ids.forEach(id => {
        const dragCopy = this.drag.dragCopies?.get(id);
        const element = dragCopy ?? this.design.get_element(id);
        const bbox = element.bbox();
        ctx.strokeStyle = "#0000ff";
        ctx.strokeRect(bbox.x1() * this.px_per_mm, bbox.y1() * this.px_per_mm, bbox.width() * this.px_per_mm, bbox.height() * this.px_per_mm);
      });
      ctx.restore();

      if (changedElements.length > 0) {
        this.$emit("elementsChanged", changedElements);
      }
    },
    onMouseDown(event: MouseEvent) {
      const xMM = event.offsetX / this.px_per_mm;
      const yMM = event.offsetY / this.px_per_mm;

      let hitId: number | null = null;
      for (let i = this.design.elements().length - 1; i >= 0; i--) {
        const el = this.design.elements()[i];
        if (el.bbox().containsPoint(xMM, yMM)) {
          hitId = el.id();
          break;
        }
      }

      if (hitId == null) {
        return;
      }

      if (!this.selected_element_ids.has(hitId)) {
        // Not part of selection: defer to click selection behavior
        return;
      }

      // Start dragging
      this.drag.isDragging = true;
      this.drag.startXMM = xMM;
      this.drag.startYMM = yMM;
      this.drag.dxMM = 0;
      this.drag.dyMM = 0;
      this.drag.initialAnchors = new Map<number, [number, number]>();
      this.drag.dragCopies = new Map<number, MovableDesignElement>();

      this.selected_element_ids.forEach((id: number) => {
        const original = this.design.get_element(id) as MovableDesignElement;//todo check if it is really movable
        const [ax, ay] = original.getAnchor();
        this.drag.initialAnchors.set(id, [ax, ay]);
        const copy = original.clone();
        this.drag.dragCopies.set(id, copy);
      });

      event.preventDefault();
    },
    onMouseMove(event: MouseEvent) {
      if (!this.drag.isDragging) return;
      const xMM = event.offsetX / this.px_per_mm;
      const yMM = event.offsetY / this.px_per_mm;
      this.drag.dxMM = xMM - this.drag.startXMM;
      this.drag.dyMM = yMM - this.drag.startYMM;

      this.drag.dragCopies.forEach((copy: MovableDesignElement, id: number) => {
        const anchor = this.drag.initialAnchors.get(id)!;
        copy.moveAnchor(anchor[0] + this.drag.dxMM, anchor[1] + this.drag.dyMM);
      });

      this.renderCanvas();
    },
    onMouseUp(event: MouseEvent) {
      const xMM = event.offsetX / this.px_per_mm;
      const yMM = event.offsetY / this.px_per_mm;
      if (!this.drag.isDragging) {
        let elementEvent: PreviewElementClickedEvent = {
          element_id: null,
          ctrlPressed: event.ctrlKey,
          shiftPressed: event.shiftKey,
        };
        for (let i = this.design.elements().length - 1; i >= 0; i--) {
          const element = this.design.elements()[i];
          if (element.bbox().containsPoint(xMM, yMM)) {
            elementEvent.element_id = element.id();
            break;
          }
        }
        this.$emit("elementClicked", elementEvent);
      } else {
        const dx = xMM - this.drag.startXMM;
        const dy = yMM - this.drag.startYMM;

        const updated: DesignElement[] = [];
        this.selected_element_ids.forEach((id: number) => {
          const original = this.design.get_element(id) as MovableDesignElement;
          const [ax0, ay0] = this.drag.initialAnchors.get(id)!;
          original.moveAnchor(ax0 + dx, ay0 + dy);
          updated.push(original);
        });

        this.drag.isDragging = false;
        this.drag.dragCopies.clear();
        this.drag.initialAnchors.clear();
        this.renderCanvas();

        this.drag.justDragged = true;

        this.$emit("elementsChanged", updated);
      }
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