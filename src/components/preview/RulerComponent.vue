<template>
  <svg
      :width="isHorizontal ? length_px : rulerWidth"
      :height="isHorizontal ? rulerWidth : length_px"
      class="ruler"
  >
    <g v-for="mm in totalMm" :key="mm">
      <!-- Regular mm lines -->
      <line
          v-if="mm % 10 !== 0 && mm % 5 !== 0"
          :x1="isHorizontal ? mm * pixelPerMm : getX(shortLength)"
          :y1="isHorizontal ? getY(shortLength) : mm * pixelPerMm"
          :x2="isHorizontal ? mm * pixelPerMm : getX(0)"
          :y2="isHorizontal ? getY(0) : mm * pixelPerMm"
          :stroke="lineColor"
          stroke-width="1"
      />

      <!-- 5mm lines (medium) -->
      <line
          v-if="mm % 5 === 0 && mm % 10 !== 0"
          :x1="isHorizontal ? mm * pixelPerMm : getX(mediumLength)"
          :y1="isHorizontal ? getY(mediumLength) : mm * pixelPerMm"
          :x2="isHorizontal ? mm * pixelPerMm : getX(0)"
          :y2="isHorizontal ? getY(0) : mm * pixelPerMm"
          :stroke="lineColor"
          stroke-width="1"
      />

      <!-- 10mm (1cm) lines (long and wider) -->
      <line
          v-if="mm % 10 === 0"
          :x1="isHorizontal ? mm * pixelPerMm : getX(longLength)"
          :y1="isHorizontal ? getY(longLength) : mm * pixelPerMm"
          :x2="isHorizontal ? mm * pixelPerMm : getX(0)"
          :y2="isHorizontal ? getY(0) : mm * pixelPerMm"
          :stroke="lineColor"
          stroke-width="2"
      />

      <!-- Labels for cm -->
      <text
          v-if="mm % 10 === 0 && mm > 0"
          :x="isHorizontal ? mm * pixelPerMm : getLabelX()"
          :y="isHorizontal ? getLabelY() : mm * pixelPerMm"
          :text-anchor="isHorizontal ? 'middle' : (direction === 'left' ? 'end' : 'start')"
          :dominant-baseline="isHorizontal ? (direction === 'top' ? 'text-after-edge' : 'text-before-edge') : 'middle'"
          font-size="10"
          :fill="lineColor"
      >
        {{ mm / 10 }}
      </text>
    </g>

    <!-- Ruler background/border -->
    <rect
        :width="isHorizontal ? length_px : rulerWidth"
        :height="isHorizontal ? rulerWidth : length_px"
        fill="none"
        :stroke="lineColor"
        stroke-width="1"
    />
  </svg>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';

type Direction = 'top' | 'bottom' | 'left' | 'right';

interface RulerData {
  rulerWidth: number;
  shortLength: number;
  mediumLength: number;
  longLength: number;
  lineColor: string;
}

export default defineComponent({
  name: 'RulerComponent',
  props: {
    pixelPerMm: {
      type: Number,
      required: true,
      default: 3.78 // roughly 96 DPI
    },
    direction: {
      type: String as PropType<Direction>,
      required: true,
      default: 'top' as Direction,
      validator: (value: string): boolean => ['top', 'bottom', 'left', 'right'].indexOf(value) != -1
    },
    length_px: {
      type: Number,
      required: true,
      default: 500 // in pixels
    }
  },
  data(): RulerData {
    return {
      rulerWidth: 32,
      shortLength: 6,
      mediumLength: 10,
      longLength: 14,
      lineColor: '#333'
    };
  },
  computed: {
    isHorizontal(): boolean {
      return this.direction === 'top' || this.direction === 'bottom';
    },
    totalMm(): number {
      return Math.floor(this.length_px / this.pixelPerMm);
    }
  },
  methods: {
    getX(lineLength: number): number {
      if (this.direction === 'left') {
        return this.rulerWidth - lineLength;
      } else if (this.direction === 'right') {
        return 0;
      }
      return 0;
    },
    getY(lineLength: number): number {
      if (this.direction === 'top') {
        return this.rulerWidth - lineLength;
      } else if (this.direction === 'bottom') {
        return 0;
      }
      return 0;
    },
    getLabelX(): number {
      if (this.direction === 'left') {
        return this.rulerWidth - this.longLength - 3;
      } else if (this.direction === 'right') {
        return this.longLength + 3;
      }
      return 0;
    },
    getLabelY(): number {
      if (this.direction === 'top') {
        return this.rulerWidth - this.longLength - 3;
      } else if (this.direction === 'bottom') {
        return this.longLength + 13;
      }
      return 0;
    }
  }
});
</script>

<style scoped>
.ruler {
  display: block;
  background-color: #f5f5f5;
}
</style>