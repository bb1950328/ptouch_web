<template>
  <div class="row mb-3">
    <label for="editorText" class="form-label">Text</label>
    <textarea class="form-control" id="editorText" rows="4" v-model="valueText"></textarea>
  </div>
  <div class="row mb-3">
    <div class="col-6">
      <label for="editorFontSize" class="form-label">Font Size</label>
      <input class="form-control" id="editorFontSize" type="number" v-model="valueFontSize"/>
    </div>
    <div class="col-6">
      <label for="editorFontFamily" class="form-label">Font Family</label>
      <!--TODO-->
    </div>
  </div>
</template>
<script lang="ts">
import {PropType} from "vue";
import {DesignElementText} from "@/design";

export default {
  name: "EditorText",
  props: {
    elements: {type: Array as PropType<DesignElementText[]>, required: true},
  },
  emits: {
    elementsChanged(elements: DesignElementText[]): boolean {
      return true;
    }
  },
  computed: {
    valueText: {
      get(): string {
        let value = this.elements[0].getText();
        for (let i = 1; i < this.elements.length; i++) {
          let v2 = this.elements[i].getText();
          if (value === v2) {
            value = "";
          }
        }
        return value;
      },
      set(newValue: string) {
        this.elements.forEach(e => e.setText(newValue));
        this.emitElementsChanged();
      }
    },
    valueFontSize: {
      get(): number {
        return this.getSingleValue(e => e.getFontSize(), 0);
      },
      set(newValue: number) {
        this.elements.forEach(e => e.setFontSize(newValue));
        this.emitElementsChanged();
      }
    }
  },
  methods: {
    emitElementsChanged() {
      this.$emit("elementsChanged", this.elements);
    },
    getSingleValue<T>(getter: (element: DesignElementText) => T, defaultValue: T): T {
      let singleValue: T = getter(this.elements[0]);
      for (let i = 0; i < this.elements.length; i++) {
        let v = getter(this.elements[i]);
        if (v !== singleValue) {
          singleValue = defaultValue;
        }
      }
      return singleValue;
    },
  }
};
</script>

<style scoped>

</style>