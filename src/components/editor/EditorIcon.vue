<template>
  <div class="row mb-3">
    <div class="col-8">
      <label for="editorIconName" class="form-label">Icon</label>
      <input class="form-control" id="editorIconName" type="text" list="iconOptions" v-model="valueIconName"/>
      <datalist id="iconOptions">
        <option value="star"></option>
        <option value="gear"></option>
        <option value="image"></option>
        <option value="font"></option>
      </datalist>
      <div class="form-text">Supported examples: star, gear, image, font</div>
    </div>
    <div class="col-4">
      <label for="editorIconSize" class="form-label">Height (mm)</label>
      <input class="form-control" id="editorIconSize" type="number" min="1" step="0.5" v-model="valueSizeMM"/>
    </div>
  </div>
</template>
<script lang="ts">
import {PropType} from "vue";
import {DesignElementIcon} from "@/design";
import {getSingleValue} from "@/components/editor/editor";

export default {
  name: "EditorIcon",
  props: {
    elements: {type: Array as PropType<DesignElementIcon[]>, required: true},
  },
  data() {
    return {
      elementsMutable: this.elements.map(e => e.clone()),
    };
  },
  emits: {
    elementsChanged(elements: DesignElementIcon[]): boolean {
      return true;
    }
  },
  computed: {
    valueIconName: {
      get(): string {
        return getSingleValue(this.elementsMutable, e => e.getIconName(), "");
      },
      set(newValue: string) {
        this.elementsMutable.forEach(e => e.setIconName(newValue));
        this.emitElementsChanged();
      }
    },
    valueSizeMM: {
      get(): number {
        return getSingleValue(this.elementsMutable, e => e.getSizeMM(), 0);
      },
      set(newValue: number) {
        if (newValue < 1) newValue = 1;
        this.elementsMutable.forEach(e => e.setSizeMM(newValue));
        this.emitElementsChanged();
      }
    },
  },
  methods: {
    emitElementsChanged() {
      this.$emit("elementsChanged", this.elementsMutable);
    }
  }
};
</script>

<style scoped>

</style>
