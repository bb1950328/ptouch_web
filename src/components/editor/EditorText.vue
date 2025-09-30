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
import {getSingleValue} from "@/components/editor/editor";

export default {
  name: "EditorText",
  props: {
    elements: {type: Array as PropType<DesignElementText[]>, required: true},
  },
  data() {
    return {
      elementsMutable: this.elements.map(e => e.clone()),
    };
  },
  emits: {
    elementsChanged(elements: DesignElementText[]): boolean {
      return true;
    }
  },
  watch: {
    elements() {
      this.elementsMutable = this.elements.map(e => e.clone());
    }
  },
  computed: {
    valueText: {
      get(): string {
        return getSingleValue(this.elementsMutable, e => e.getText(), "");
      },
      set(newValue: string) {
        this.elementsMutable.forEach(e => e.setText(newValue));
        this.emitElementsChanged();
      }
    },
    valueFontSize: {
      get(): number {
        return getSingleValue(this.elementsMutable, e => e.getFontSize(), 0);
      },
      set(newValue: number) {
        this.elementsMutable.forEach(e => e.setFontSize(newValue));
        this.emitElementsChanged();
      }
    }
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